from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from google_play_scraper import app as play_app, reviews, Sort
import asyncio
from typing import List, Dict
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api = FastAPI()

# Configure CORS
api.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize sentiment analysis pipelines
sentiment_analyzers = {
    "distilbert": pipeline(
        "sentiment-analysis",
        model="distilbert-base-uncased-finetuned-sst-2-english"
    ),
    "roberta": pipeline(
        "sentiment-analysis",
        model="cardiffnlp/twitter-roberta-base-sentiment"
    ),
    "multilingual": pipeline(
        "sentiment-analysis",
        model="nlptown/bert-base-multilingual-uncased-sentiment"
    )
}

class AppInput(BaseModel):
    input: str

def extract_package_name(input_str: str) -> str:
    """Extract package name from Google Play Store URL or return the input if it's already a package name."""
    # Pattern for Google Play Store URLs
    play_store_pattern = r'play\.google\.com/store/apps/details\?id=([a-zA-Z0-9._]+)'
    
    # Check if input is a URL
    match = re.search(play_store_pattern, input_str)
    if match:
        return match.group(1)
    
    # If not a URL, assume it's a package name
    return input_str

def get_sentiment_category(score: float) -> Dict[str, any]:
    """Convert score to sentiment category and metadata."""
    if score >= 0.8:
        return {
            "category": "Very Positive",
            "color": "#22c55e",  # green-500
            "emoji": "😊",
            "description": "Overwhelmingly positive sentiment"
        }
    elif score >= 0.6:
        return {
            "category": "Mildly Positive",
            "color": "#4ade80",  # green-400
            "emoji": "🙂",
            "description": "Generally positive sentiment"
        }
    elif score >= 0.4:
        return {
            "category": "Neutral",
            "color": "#eab308",  # yellow-500
            "emoji": "😐",
            "description": "Mixed or neutral sentiment"
        }
    elif score >= 0.2:
        return {
            "category": "Mildly Negative",
            "color": "#f87171",  # red-400
            "emoji": "🙁",
            "description": "Generally negative sentiment"
        }
    else:
        return {
            "category": "Very Negative",
            "color": "#ef4444",  # red-500
            "emoji": "😞",
            "description": "Overwhelmingly negative sentiment"
        }

async def analyze_sentiment(review: str, model_name: str) -> float:
    """Analyze sentiment of a single review using specified model and return a score."""
    try:
        analyzer = sentiment_analyzers[model_name]
        result = analyzer(review)[0]
        
        # Convert different model outputs to consistent 0-1 scale
        if model_name == "distilbert":
            return 1.0 if result['label'] == 'POSITIVE' else 0.0
        elif model_name == "roberta":
            # roberta returns: LABEL_0 (negative), LABEL_1 (neutral), LABEL_2 (positive)
            if result['label'] == 'LABEL_2':
                return 1.0
            elif result['label'] == 'LABEL_1':
                return 0.5
            return 0.0
        else:  # multilingual
            # multilingual returns 1-5 stars
            return (int(result['label'].split()[0]) - 1) / 4.0
            
    except Exception as e:
        logger.error(f"Error analyzing sentiment with {model_name}: {str(e)}")
        return 0.5

async def process_reviews(reviews: List[Dict]) -> Dict[str, tuple[float, int]]:
    """Process reviews concurrently with all models and calculate average sentiment."""
    results = {}
    for model_name in sentiment_analyzers.keys():
        tasks = [analyze_sentiment(review['content'], model_name) for review in reviews]
        scores = await asyncio.gather(*tasks)
        results[model_name] = (sum(scores) / len(scores), len(scores))
    return results

@api.post("/analyze")
async def analyze_app_reviews(app_input: AppInput):
    try:
        # Extract package name from input (URL or package name)
        package_name = extract_package_name(app_input.input)
        
        # First, get app details to verify the app exists
        app_details = play_app(package_name)
        
        # Fetch reviews with continuation token for pagination
        all_reviews = []
        continuation_token = None
        
        # Fetch reviews in batches of 100
        while len(all_reviews) < 100:
            result = reviews(
                package_name,
                lang='en',  # Language
                country='us',  # Country
                sort=Sort.NEWEST,  # Sort by newest
                count=100,  # Number of reviews to fetch
                continuation_token=continuation_token
            )
            
            reviews_batch = result[0]
            continuation_token = result[1]
            
            all_reviews.extend(reviews_batch)
            
            if not continuation_token or len(reviews_batch) == 0:
                break
        
        if not all_reviews:
            raise HTTPException(status_code=404, detail="No reviews found for this app")
        
        # Process reviews and calculate average sentiment for all models
        model_results = await process_reviews(all_reviews[:100])
        
        # Format results with sentiment categories
        sentiment_results = {
            "app_name": package_name,
            "app_title": app_details.get('title', ''),
            "app_url": f"https://play.google.com/store/apps/details?id={package_name}",
            "review_count": len(all_reviews[:100]),
            "models": {
                "DistilBERT": {
                    "score": model_results["distilbert"][0],
                    "sentiment": get_sentiment_category(model_results["distilbert"][0]),
                    "description": "Binary sentiment analysis (positive/negative)"
                },
                "RoBERTa": {
                    "score": model_results["roberta"][0],
                    "sentiment": get_sentiment_category(model_results["roberta"][0]),
                    "description": "Three-way sentiment analysis (positive/neutral/negative)"
                },
                "Multilingual BERT": {
                    "score": model_results["multilingual"][0],
                    "sentiment": get_sentiment_category(model_results["multilingual"][0]),
                    "description": "5-star rating based sentiment analysis"
                }
            }
        }
        
        return sentiment_results
        
    except Exception as e:
        logger.error(f"Error processing app reviews: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(api, host="0.0.0.0", port=8000) 