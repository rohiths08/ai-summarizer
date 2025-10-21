'use client';

import { useState, useEffect } from "react";

export default function Home() {
  const [summary, setSummary] = useState("");
  const [keyPoints, setKeyPoints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Link to the repository
  const repoUrl = "https://github.com/rohiths08/ai-summarizer";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: isMobile ? '20px 16px' : '40px 20px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '30px' : '50px' }}>
          <h1 style={{ 
            fontSize: isMobile ? '2.5rem' : '3.5rem', 
            fontWeight: '900', 
            color: 'white',
            margin: '0 0 16px 0',
            textShadow: '0 4px 8px rgba(0,0,0,0.2)',
            lineHeight: '1.1'
          }}>
            🤖 Smart Summarizer
          </h1>
          <p style={{ 
            fontSize: isMobile ? '1rem' : '1.2rem', 
            color: 'rgba(255,255,255,0.9)', 
            margin: '0',
            padding: isMobile ? '0 10px' : '0'
          }}>
            AI-powered article analysis with summary and key insights
          </p>
        </div>

        {/* Input Form */}
        <div style={{ 
          background: 'white', 
          borderRadius: isMobile ? '16px' : '20px', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
          padding: isMobile ? '24px' : '40px', 
          marginBottom: '30px'
        }}>
          <form onSubmit={handleSummarize}>
            <input
              type="text"
              placeholder={isMobile ? "Paste URL here..." : "Paste article URL here..."}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: isMobile ? '14px 16px' : '16px 20px',
                fontSize: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                outline: 'none',
                marginBottom: '20px',
                fontFamily: 'inherit',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
              disabled={loading}
              required
            />
            
            <button 
              type="submit" 
              disabled={loading || !url}
              style={{
                width: '100%',
                padding: isMobile ? '14px' : '16px',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                borderRadius: '12px',
                border: 'none',
                cursor: loading || !url ? 'not-allowed' : 'pointer',
                background: loading || !url ? '#d1d5db' : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                fontFamily: 'inherit',
                WebkitAppearance: 'none',
                appearance: 'none',
                touchAction: 'manipulation'
              }}
            >
              {loading ? 'Analyzing...' : isMobile ? 'Analyze' : 'Analyze Article'}
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ 
            background: 'white', 
            borderRadius: isMobile ? '16px' : '20px', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
            padding: isMobile ? '30px 20px' : '40px', 
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <div style={{ 
              width: isMobile ? '40px' : '50px',
              height: isMobile ? '40px' : '50px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ 
              fontSize: isMobile ? '14px' : '16px',
              margin: '0'
            }}>
              AI is analyzing your article...
            </p>
          </div>
        )}

        {/* Results */}
        {(summary || keyPoints.length > 0) && (
          <div style={{ 
            background: 'white', 
            borderRadius: isMobile ? '16px' : '20px', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
            padding: isMobile ? '24px' : '40px',
            marginBottom: '30px'
          }}>
            <h2 style={{ 
              fontSize: isMobile ? '1.25rem' : '1.5rem', 
              fontWeight: '700', 
              color: '#1f2937',
              marginBottom: '20px',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              📊 Analysis Results
            </h2>
            
            {summary && (
              <div style={{ marginBottom: isMobile ? '24px' : '30px' }}>
                <h3 style={{ 
                  fontSize: isMobile ? '1rem' : '1.1rem', 
                  fontWeight: '600', 
                  marginBottom: '10px' 
                }}>
                  📄 Summary
                </h3>
                <div style={{ 
                  padding: isMobile ? '16px' : '20px', 
                  background: '#f8fafc', 
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ 
                    margin: '0', 
                    lineHeight: '1.6',
                    fontSize: isMobile ? '14px' : '16px'
                  }}>
                    {summary}
                  </p>
                </div>
              </div>
            )}

            {keyPoints.length > 0 && (
              <div style={{ marginBottom: isMobile ? '24px' : '30px' }}>
                <h3 style={{ 
                  fontSize: isMobile ? '1rem' : '1.1rem', 
                  fontWeight: '600', 
                  marginBottom: '10px' 
                }}>
                  🎯 Key Points
                </h3>
                <div style={{ 
                  padding: isMobile ? '16px' : '20px', 
                  background: '#fef7ff', 
                  borderRadius: '12px',
                  border: '1px solid #e9d5ff'
                }}>
                  <ul style={{ 
                    margin: '0', 
                    paddingLeft: isMobile ? '16px' : '20px' 
                  }}>
                    {keyPoints.map((point, index) => (
                      <li key={index} style={{ 
                        marginBottom: '8px', 
                        lineHeight: '1.6',
                        fontSize: isMobile ? '14px' : '15px'
                      }}>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              gap: isMobile ? '8px' : '12px', 
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
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
                  padding: isMobile ? '12px 16px' : '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '500',
                  touchAction: 'manipulation',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  minWidth: isMobile ? '120px' : 'auto'
                }}
              >
                {isMobile ? '📋 Copy' : '📋 Copy All'}
              </button>
              
              {url && (
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    padding: isMobile ? '12px 16px' : '10px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontFamily: 'inherit',
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: '500',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: isMobile ? '120px' : 'auto'
                  }}
                >
                  {isMobile ? '🔗 Source' : '🔗 View Source'}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ 
            background: '#fef2f2', 
            borderRadius: isMobile ? '16px' : '20px', 
            padding: isMobile ? '20px' : '30px',
            border: '1px solid #fecaca'
          }}>
            <h3 style={{ 
              color: '#dc2626', 
              marginBottom: '10px',
              fontSize: isMobile ? '1rem' : '1.1rem',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              Error
            </h3>
            <p style={{ 
              color: '#b91c1c', 
              margin: '0',
              fontSize: isMobile ? '14px' : '16px',
              lineHeight: '1.5',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Repository Link Footer */}
        <div style={{
          marginTop: '18px',
          textAlign: 'center'
        }}>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open GitHub repository"
            style={{
              color: 'rgba(255,255,255,0.95)',
              background: 'transparent',
              padding: isMobile ? '8px 12px' : '10px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: isMobile ? '14px' : '15px'
            }}
          >
            🐙 View project on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
