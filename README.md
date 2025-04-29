# App Sentiment Analyzer

A modern web application that analyzes Google Play Store app reviews using multiple AI models for sentiment analysis. Built with FastAPI, Next.js, and Tailwind CSS.

## Features

- **Multi-Model Sentiment Analysis**: Uses three different AI models for comprehensive sentiment analysis:
  - DistilBERT: Binary sentiment analysis (positive/negative)
  - RoBERTa: Three-way sentiment analysis (positive/neutral/negative)
  - Multilingual BERT: 5-star rating based sentiment analysis

- **Smart Input Handling**: Accepts both:
  - App package names (e.g., com.whatsapp)
  - Google Play Store URLs

- **Detailed Sentiment Visualization**:
  - Circular gauge visualization for sentiment scores
  - Color-coded sentiment categories
  - Emoji indicators
  - Detailed sentiment descriptions

- **Modern UI/UX**:
  - Responsive design
  - Beautiful gradient backgrounds
  - Smooth animations and transitions
  - Glassmorphism effects
  - Interactive hover states

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

## Sentiment Categories

The application categorizes sentiment into five levels:

1. **Very Positive** (≥ 0.8)
   - Color: Green
   - Emoji: 😊
   - Description: Overwhelmingly positive sentiment

2. **Mildly Positive** (≥ 0.6)
   - Color: Light Green
   - Emoji: 🙂
   - Description: Generally positive sentiment

3. **Neutral** (≥ 0.4)
   - Color: Yellow
   - Emoji: 😐
   - Description: Mixed or neutral sentiment

4. **Mildly Negative** (≥ 0.2)
   - Color: Light Red
   - Emoji: 🙁
   - Description: Generally negative sentiment

5. **Very Negative** (< 0.2)
   - Color: Red
   - Emoji: 😞
   - Description: Overwhelmingly negative sentiment

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Transformers](https://huggingface.co/transformers/)
- [Google Play Scraper](https://github.com/JoMingyu/google-play-scraper) 