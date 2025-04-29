# App Sentiment Analyzer

A modern web application that analyzes Google Play Store app reviews using multiple AI models for sentiment analysis. Built with FastAPI, Next.js, and Tailwind CSS.

**Multi-Model Sentiment Analysis**: Uses three different AI models for comprehensive sentiment analysis:
- DistilBERT: Binary sentiment analysis (positive/negative)
- RoBERTa: Three-way sentiment analysis (positive/neutral/negative)
- Multilingual BERT: 5-star rating based sentiment analysis

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **Python**: Core programming language
- **Google Play Scraper**: For fetching app reviews
- **Transformers**: For sentiment analysis models
- **Uvicorn**: ASGI server for running FastAPI

### Frontend
- **Next.js**: React framework for production
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **Axios**: For API requests
- **React Hooks**: For state management

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd app-sentiment-analyzer
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:api --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
app-sentiment-analyzer/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── pages/              # Next.js pages
│   ├── styles/             # Global styles
│   ├── public/             # Static assets
│   ├── package.json        # Node.js dependencies
│   └── tailwind.config.js  # Tailwind configuration
└── README.md
```

## API Endpoints

### POST /analyze
Analyzes app reviews and returns sentiment analysis results.

**Request Body:**
```json
{
  "input": "com.whatsapp"  // or Google Play Store URL
}
```

**Response:**
```json
{
  "app_name": "com.whatsapp",
  "app_title": "WhatsApp Messenger",
  "app_url": "https://play.google.com/store/apps/details?id=com.whatsapp",
  "review_count": 100,
  "models": {
    "DistilBERT": {
      "score": 0.85,
      "sentiment": {
        "category": "Very Positive",
        "color": "#22c55e",
        "emoji": "😊",
        "description": "Overwhelmingly positive sentiment"
      },
      "description": "Binary sentiment analysis (positive/negative)"
    },
    // ... other models
  }
}
```

