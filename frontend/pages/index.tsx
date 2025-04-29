import { useState } from 'react';
import axios from 'axios';
import Head from 'next/head';

interface SentimentInfo {
  category: string;
  color: string;
  emoji: string;
  description: string;
}

interface ModelResult {
  score: number;
  sentiment: SentimentInfo;
  description: string;
}

interface AnalysisResult {
  app_name: string;
  app_title: string;
  app_url: string;
  review_count: number;
  models: {
    [key: string]: ModelResult;
  };
}

const SentimentGauge = ({ score, color }: { score: number; color: string }) => {
  const percentage = score * 100;
  const rotation = (score * 180) - 90;
  
  return (
    <div className="relative w-40 h-20 mx-auto mb-6">
      {/* Background arc */}
      <div className="absolute w-full h-full border-4 border-gray-100 rounded-t-full"></div>
      
      {/* Colored arc */}
      <div 
        className="absolute w-full h-full border-4 rounded-t-full transition-all duration-1000 ease-out"
        style={{ 
          borderColor: color,
          clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'bottom center'
        }}
      ></div>
      
      {/* Needle */}
      <div 
        className="absolute bottom-0 left-1/2 w-1 h-10 bg-gray-800 transition-transform duration-1000 ease-out"
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'bottom center'
        }}
      ></div>
      
      {/* Score display */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 text-2xl font-bold" style={{ color }}>
        {percentage.toFixed(1)}%
      </div>
    </div>
  );
};

const SentimentCard = ({ 
  modelName, 
  modelResult 
}: { 
  modelName: string; 
  modelResult: ModelResult 
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-2xl text-gray-800">{modelName}</h3>
        <span className="text-5xl">{modelResult.sentiment.emoji}</span>
      </div>
      
      <p className="text-gray-600 mb-8">{modelResult.description}</p>
      
      <div className="space-y-6">
        <SentimentGauge score={modelResult.score} color={modelResult.sentiment.color} />
        
        <div className="text-center">
          <span 
            className="text-3xl font-bold block mb-2"
            style={{ color: modelResult.sentiment.color }}
          >
            {modelResult.sentiment.category}
          </span>
          <p className="text-gray-600 italic">
            {modelResult.sentiment.description}
          </p>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

const AppInfoCard = ({ result }: { result: AnalysisResult }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-4xl font-bold text-gray-800 mb-2">{result.app_title}</h2>
        <p className="text-gray-600">Package: {result.app_name}</p>
      </div>
      <a 
        href={result.app_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl flex items-center space-x-2 transition-colors duration-200"
      >
        <span>View on Play Store</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </a>
    </div>
    <p className="text-gray-600">
      Analyzed {result.review_count} recent reviews
    </p>
  </div>
);

const SearchCard = ({ 
  input, 
  setInput, 
  analyzeApp, 
  loading, 
  error 
}: { 
  input: string;
  setInput: (value: string) => void;
  analyzeApp: () => void;
  loading: boolean;
  error: string;
}) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100">
    <div className="mb-6">
      <label htmlFor="appInput" className="block text-gray-700 text-xl font-bold mb-4">
        Enter App Package Name or Google Play Store URL
      </label>
      <div className="flex gap-4">
        <input
          type="text"
          id="appInput"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 shadow appearance-none border rounded-xl py-4 px-6 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
          placeholder="e.g., com.whatsapp or https://play.google.com/store/apps/details?id=com.whatsapp"
        />
        <button
          onClick={analyzeApp}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 text-lg"
        >
          {loading ? <LoadingSpinner /> : 'Analyze'}
        </button>
      </div>
      <p className="text-gray-500 mt-3">
        You can enter either the app's package name (e.g., com.whatsapp) or its Google Play Store URL
      </p>
    </div>

    {error && (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        {error}
      </div>
    )}
  </div>
);

export default function Home() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeApp = async () => {
    if (!input.trim()) {
      setError('Please enter an app package name or Google Play Store URL');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8000/analyze', {
        input: input.trim()
      });
      setResult(response.data);
    } catch (err) {
      setError('Error analyzing app reviews. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Head>
        <title>App Sentiment Analyzer</title>
        <meta name="description" content="Analyze Google Play Store app reviews" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-gray-800 mb-6">
              App Sentiment Analyzer
            </h1>
            <p className="text-2xl text-gray-600 max-w-2xl mx-auto">
              Analyze sentiment of Google Play Store app reviews using multiple AI models
            </p>
          </div>
          
          <div className="space-y-16">
            <SearchCard 
              input={input}
              setInput={setInput}
              analyzeApp={analyzeApp}
              loading={loading}
              error={error}
            />

            {result && (
              <>
                <AppInfoCard result={result} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {Object.entries(result.models).map(([modelName, modelResult]) => (
                    <SentimentCard 
                      key={modelName} 
                      modelName={modelName} 
                      modelResult={modelResult} 
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 