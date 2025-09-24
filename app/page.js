'use client';

import { useState } from "react";

export default function Home() {
  const [summary, setSummary] = useState("");
  const [keyPoints, setKeyPoints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState("");

  const validateUrl = (urlString) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    console.log("🚀 Starting summarization for:", url);
    setLoading(true);
    setSummary("");
    setKeyPoints([]);
    setStats(null);
    setError(null);
    
    try {
      console.log("📡 Calling extract API...");
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      
      console.log("📡 Extract response status:", extractRes.status);
      const extractData = await extractRes.json();
      console.log("📡 Extract data:", extractData);
      
      if (extractData.error) throw new Error(extractData.error);

      console.log("🤖 Calling summarize API...");
      const summarizeRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractData.text }),
      });
      
      console.log("🤖 Summarize response status:", summarizeRes.status);
      const summarizeData = await summarizeRes.json();
      console.log("🤖 Summarize data:", summarizeData);
      
      if (summarizeData.error) throw new Error(summarizeData.error);

      console.log("✅ Success! Setting summary and key points");
      setSummary(summarizeData.summary);
      setKeyPoints(summarizeData.keyPoints || []);
      setStats(summarizeData.stats);
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '900', 
            color: 'white',
            margin: '0 0 16px 0',
            textShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}>
            🤖 Smart Summarizer
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: 'rgba(255,255,255,0.9)', 
            margin: '0'
          }}>
            AI-powered article analysis with summary and key insights
          </p>
        </div>

        {/* Input Form */}
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
          padding: '40px', 
          marginBottom: '30px'
        }}>
          <form onSubmit={handleSummarize}>
            <input
              type="text"
              placeholder="Paste article URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '16px 20px',
                fontSize: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                outline: 'none',
                marginBottom: '20px',
                fontFamily: 'inherit'
              }}
              disabled={loading}
              required
            />
            
            <button 
              type="submit" 
              disabled={loading || !url}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                borderRadius: '12px',
                border: 'none',
                cursor: loading || !url ? 'not-allowed' : 'pointer',
                background: loading || !url ? '#d1d5db' : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                fontFamily: 'inherit'
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze Article'}
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
            padding: '40px', 
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <div style={{ 
              width: '50px',
              height: '50px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>AI is analyzing your article...</p>
          </div>
        )}

        {/* Results */}
        {(summary || keyPoints.length > 0) && (
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
            padding: '40px',
            marginBottom: '30px'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#1f2937',
              marginBottom: '20px'
            }}>
              📊 Analysis Results
            </h2>
            
            {summary && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '10px' }}>
                  📄 Summary
                </h3>
                <div style={{ 
                  padding: '20px', 
                  background: '#f8fafc', 
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ margin: '0', lineHeight: '1.6' }}>{summary}</p>
                </div>
              </div>
            )}

            {keyPoints.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '10px' }}>
                  🎯 Key Points
                </h3>
                <div style={{ 
                  padding: '20px', 
                  background: '#fef7ff', 
                  borderRadius: '12px',
                  border: '1px solid #e9d5ff'
                }}>
                  <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    {keyPoints.map((point, index) => (
                      <li key={index} style={{ marginBottom: '8px', lineHeight: '1.6' }}>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={async () => {
                  try {
                    let textToCopy = '';
                    if (summary) textToCopy += `SUMMARY:\n${summary}\n\n`;
                    if (keyPoints.length > 0) {
                      textToCopy += `KEY POINTS:\n${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}`;
                    }
                    await navigator.clipboard.writeText(textToCopy);
                    alert('Copied to clipboard!');
                  } catch (err) {
                    alert('Failed to copy');
                  }
                }}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                📋 Copy All
              </button>
              
              {url && (
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontFamily: 'inherit'
                  }}
                >
                  🔗 View Source
                </a>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ 
            background: '#fef2f2', 
            borderRadius: '20px', 
            padding: '30px',
            border: '1px solid #fecaca'
          }}>
            <h3 style={{ color: '#dc2626', marginBottom: '10px' }}>Error</h3>
            <p style={{ color: '#b91c1c', margin: '0' }}>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}