'use client';

import { useState } from "react";

export default function UrlForm({ onSubmit, loading }) {
  const [url, setUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(true);

  const validateUrl = (urlString) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url && validateUrl(url)) {
      setIsValidUrl(true);
      onSubmit(url);
    } else {
      setIsValidUrl(false);
    }
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (newUrl && !isValidUrl) {
      setIsValidUrl(validateUrl(newUrl));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <input
            type="url"
            placeholder="Paste any article URL here (e.g., news, blog, Wikipedia)..."
            value={url}
            onChange={handleUrlChange}
            className={`w-full pl-10 pr-4 py-4 text-lg border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 ${
              !isValidUrl 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50' 
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100 bg-white hover:border-gray-300'
            }`}
            disabled={loading}
            required
          />
          {!isValidUrl && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>
        
        {!isValidUrl && (
          <p className="text-red-600 text-sm flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Please enter a valid URL (e.g., https://example.com/article)
          </p>
        )}

        <button 
          type="submit" 
          disabled={loading || !url || !isValidUrl}
          className={`w-full py-4 px-6 text-lg font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 ${
            loading || !url || !isValidUrl
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Summarize Article
            </>
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">
          ✨ Powered by AI • Works with news articles, blogs, and web pages
        </p>
      </div>
    </div>
  );
}