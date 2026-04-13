'use client';

import { useState, useEffect, useRef } from "react";

const MODES = [
  { id: "summary",   label: "Summary",     emoji: "📄", desc: "Concise overview"  },
  { id: "bullets",   label: "Key Points",  emoji: "📋", desc: "5 takeaways"       },
  { id: "eli5",      label: "ELI5",        emoji: "🧒", desc: "Simple language"   },
  { id: "sentiment", label: "Sentiment",   emoji: "😊", desc: "Tone analysis"     },
];

export default function Home() {
  const [url,             setUrl]             = useState("");
  const [mode,            setMode]            = useState("summary");
  const [output,          setOutput]          = useState("");
  const [displayedOutput, setDisplayedOutput] = useState("");
  const [stats,           setStats]           = useState(null);
  const [model,           setModel]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);
  const [isMobile,        setIsMobile]        = useState(false);
  const [articleText,     setArticleText]     = useState("");
  const [showChat,        setShowChat]        = useState(false);
  const [chatMessages,    setChatMessages]    = useState([]);
  const [chatInput,       setChatInput]       = useState("");
  const [chatLoading,     setChatLoading]     = useState(false);
  const [copied,          setCopied]          = useState(false);

  const chatEndRef = useRef(null);
  const repoUrl    = "https://github.com/rohiths08/ai-summarizer";

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!output) { setDisplayedOutput(""); return; }
    setDisplayedOutput("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < output.length) {
        setDisplayedOutput(output.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 14);
    return () => clearInterval(interval);
  }, [output]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setOutput("");
    setDisplayedOutput("");
    setStats(null);
    setError(null);
    setShowChat(false);
    setChatMessages([]);
    setArticleText("");

    try {
      // Step 1: Extract
      const extractRes  = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const extractData = await extractRes.json();
      if (extractData.error) throw new Error(extractData.error);
      setArticleText(extractData.text);

      // Step 2: Summarize / Analyze
      const summarizeRes  = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractData.text, mode }),
      });
      const summarizeData = await summarizeRes.json();
      if (summarizeData.error) throw new Error(summarizeData.error);

      setOutput(summarizeData.output);
      setStats(summarizeData.stats);
      setModel(summarizeData.model);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage     = { role: "user", content: chatInput };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const res  = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleText, messages: updatedMessages }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChatMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setChatMessages([
        ...updatedMessages,
        { role: "assistant", content: "Sorry, I couldn't respond. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentMode = MODES.find((m) => m.id === mode);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', sans-serif;
          background: #08071a;
          color: white;
        }

        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes fadeUp    { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink     { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 0 20px rgba(139,92,246,0.25); }
          50%      { box-shadow: 0 0 35px rgba(139,92,246,0.5); }
        }

        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .glass-hover {
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .glass-hover:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.14);
        }

        /* Mode buttons */
        .mode-btn {
          flex: 1;
          min-width: 0;
          padding: 12px 6px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
          text-align: center;
          line-height: 1.3;
        }
        .mode-btn:hover {
          background: rgba(139,92,246,0.12);
          border-color: rgba(139,92,246,0.35);
          color: rgba(255,255,255,0.8);
          transform: translateY(-1px);
        }
        .mode-btn.active {
          background: linear-gradient(135deg, rgba(139,92,246,0.28), rgba(99,102,241,0.28));
          border-color: rgba(139,92,246,0.55);
          color: white;
          animation: glow-pulse 2.5s ease-in-out infinite;
        }

        /* URL input */
        .url-input {
          width: 100%;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-bottom: 14px;
        }
        .url-input::placeholder { color: rgba(255,255,255,0.28); }
        .url-input:focus {
          border-color: rgba(139,92,246,0.5);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
        }

        /* Analyze button */
        .analyze-btn {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white;
          letter-spacing: 0.3px;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          position: relative;
          overflow: hidden;
        }
        .analyze-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(124,58,237,0.45);
        }
        .analyze-btn:active:not(:disabled) { transform: translateY(0); }
        .analyze-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* Output card */
        .output-card { animation: fadeUp 0.45s ease forwards; }

        /* Chat bubbles */
        .bubble-user {
          background: linear-gradient(135deg, rgba(124,58,237,0.38), rgba(79,70,229,0.38));
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 16px 16px 4px 16px;
          padding: 10px 14px;
          max-width: 82%;
          align-self: flex-end;
          font-size: 14px;
          line-height: 1.55;
          color: rgba(255,255,255,0.9);
        }
        .bubble-ai {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px 16px 16px 4px;
          padding: 10px 14px;
          max-width: 82%;
          align-self: flex-start;
          font-size: 14px;
          line-height: 1.55;
          color: rgba(255,255,255,0.82);
        }

        /* Chat input */
        .chat-input {
          flex: 1;
          padding: 11px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .chat-input::placeholder { color: rgba(255,255,255,0.28); }
        .chat-input:focus { border-color: rgba(139,92,246,0.45); }

        /* Buttons */
        .icon-btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.65);
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .icon-btn:hover {
          background: rgba(255,255,255,0.1);
          color: white;
          border-color: rgba(255,255,255,0.2);
        }
        .icon-btn.purple {
          background: rgba(139,92,246,0.14);
          border-color: rgba(139,92,246,0.3);
          color: #c4b5fd;
        }
        .icon-btn.purple:hover {
          background: rgba(139,92,246,0.25);
          border-color: rgba(139,92,246,0.5);
          color: white;
        }

        .send-btn {
          padding: 11px 18px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 5px 14px rgba(124,58,237,0.4);
        }
        .send-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* Cursor blink */
        .cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: #a78bfa;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 0.9s step-end infinite;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.35); border-radius: 2px; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0f0c29 0%, #1a1040 40%, #24243e 100%)",
        padding: isMobile ? "24px 16px 48px" : "48px 24px 72px",
      }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>

          {/* ── HEADER ── */}
          <div style={{ textAlign: "center", marginBottom: isMobile ? "36px" : "52px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(139,92,246,0.12)",
              border: "1px solid rgba(139,92,246,0.28)",
              borderRadius: "20px", padding: "5px 16px",
              fontSize: "12px", color: "#a78bfa", fontWeight: "600",
              letterSpacing: "0.4px", marginBottom: "22px",
            }}>
              ✨ POWERED BY QWEN2.5 · HUGGING FACE INFERENCE API
            </div>

            <h1 style={{
              fontSize: isMobile ? "2.4rem" : "3.6rem",
              fontWeight: "900",
              lineHeight: 1.08,
              marginBottom: "14px",
              background: "linear-gradient(135deg, #ffffff 30%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              🤖 Gen AI Summarizer
            </h1>

            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: isMobile ? "0.95rem" : "1.1rem", maxWidth: "520px", margin: "0 auto", lineHeight: 1.6 }}>
              Paste any article URL. Choose your analysis mode.  
              Let <span style={{ color: "#a78bfa", fontWeight: "600" }}>Qwen2.5</span> do the thinking.
            </p>
          </div>

          {/* ── INPUT CARD ── */}
          <div className="glass" style={{ borderRadius: "20px", padding: isMobile ? "24px" : "36px", marginBottom: "20px" }}>

            {/* Mode selector */}
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px" }}>
              Analysis Mode
            </p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "22px", flexWrap: isMobile ? "wrap" : "nowrap" }}>
              {MODES.map((m) => (
                <button
                  key={m.id}
                  className={`mode-btn ${mode === m.id ? "active" : ""}`}
                  onClick={() => setMode(m.id)}
                  id={`mode-${m.id}`}
                >
                  <div style={{ fontSize: "20px", marginBottom: "3px" }}>{m.emoji}</div>
                  <div style={{ fontSize: "12px", fontWeight: "700" }}>{m.label}</div>
                  <div style={{ fontSize: "10px", opacity: 0.55, marginTop: "1px" }}>{m.desc}</div>
                </button>
              ))}
            </div>

            <form onSubmit={handleAnalyze}>
              <input
                id="article-url-input"
                type="text"
                className="url-input"
                placeholder="https://example.com/article..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                required
              />
              <button
                id="analyze-btn"
                type="submit"
                className="analyze-btn"
                disabled={loading || !url.trim()}
              >
                {loading
                  ? "🧠 Qwen2.5 is thinking..."
                  : `${currentMode?.emoji} ${currentMode?.label} this Article`}
              </button>
            </form>
          </div>

          {/* ── LOADING ── */}
          {loading && (
            <div className="glass" style={{ borderRadius: "20px", padding: "44px", textAlign: "center", marginBottom: "20px" }}>
              <div style={{
                width: "48px", height: "48px",
                border: "3px solid rgba(139,92,246,0.18)",
                borderTop: "3px solid #a78bfa",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px",
              }} />
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", fontWeight: "600", marginBottom: "6px" }}>
                Qwen2.5 is analyzing your article…
              </p>
              <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "13px" }}>
                Free tier may take 10–30 seconds — hang tight
              </p>
            </div>
          )}

          {/* ── OUTPUT ── */}
          {displayedOutput && !loading && (
            <div className="glass output-card" style={{ borderRadius: "20px", padding: isMobile ? "24px" : "36px", marginBottom: "20px" }}>

              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px", gap: "12px", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "white" }}>
                  {currentMode?.emoji} {currentMode?.label} Results
                </h2>
                <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                  {stats && (
                    <span className="tag" style={{ background: "rgba(99,102,241,0.14)", border: "1px solid rgba(99,102,241,0.28)", color: "#a5b4fc" }}>
                      📊 {stats.wordCount} words
                    </span>
                  )}
                  {model && (
                    <span className="tag" style={{ background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.28)", color: "#c4b5fd" }}>
                      🤖 {model.split("/")[1]}
                    </span>
                  )}
                </div>
              </div>

              {/* AI Output with typewriter */}
              <div style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "14px",
                padding: "20px 22px",
                marginBottom: "18px",
                whiteSpace: "pre-wrap",
                lineHeight: "1.75",
                color: "rgba(255,255,255,0.85)",
                fontSize: isMobile ? "14px" : "15px",
                minHeight: "80px",
              }}>
                {displayedOutput}
                {displayedOutput.length < output.length && <span className="cursor" />}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <button id="copy-btn" className="icon-btn" onClick={handleCopy}>
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>

                {url && (
                  <a id="source-link" href={url} target="_blank" rel="noopener noreferrer" className="icon-btn">
                    🔗 View Source
                  </a>
                )}

                <button
                  id="toggle-chat-btn"
                  className="icon-btn purple"
                  style={{ marginLeft: "auto" }}
                  onClick={() => setShowChat(!showChat)}
                >
                  {showChat ? "✕ Close Chat" : "💬 Ask AI About This"}
                </button>
              </div>
            </div>
          )}

          {/* ── CHAT PANEL ── */}
          {showChat && articleText && (
            <div className="glass output-card" style={{ borderRadius: "20px", padding: isMobile ? "22px" : "30px", marginBottom: "20px" }}>

              <div style={{ marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "white", marginBottom: "4px" }}>
                  💬 Ask AI About This Article
                </h3>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.32)" }}>
                  Context-aware Q&amp;A · Powered by Qwen2.5
                </p>
              </div>

              {/* Messages */}
              <div style={{
                maxHeight: "340px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "14px",
                paddingRight: "4px",
              }}>
                {chatMessages.length === 0 && (
                  <p style={{ color: "rgba(255,255,255,0.22)", fontSize: "13px", textAlign: "center", padding: "28px 0" }}>
                    Ask anything about the article…
                  </p>
                )}

                {chatMessages.map((msg, i) => (
                  <div key={i} className={msg.role === "user" ? "bubble-user" : "bubble-ai"}>
                    {msg.content}
                  </div>
                ))}

                {chatLoading && (
                  <div className="bubble-ai" style={{ color: "rgba(255,255,255,0.38)", fontStyle: "italic" }}>
                    🧠 Thinking…
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat input */}
              <form onSubmit={handleChat} style={{ display: "flex", gap: "8px" }}>
                <input
                  id="chat-input"
                  type="text"
                  className="chat-input"
                  placeholder="What is the main argument? Who wrote this?"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                />
                <button
                  id="chat-send-btn"
                  type="submit"
                  className="send-btn"
                  disabled={chatLoading || !chatInput.trim()}
                >
                  Send ↑
                </button>
              </form>
            </div>
          )}

          {/* ── ERROR ── */}
          {error && (
            <div style={{
              background: "rgba(220,38,38,0.09)",
              border: "1px solid rgba(220,38,38,0.28)",
              borderRadius: "16px",
              padding: "20px 24px",
              marginBottom: "20px",
              animation: "fadeUp 0.3s ease forwards",
            }}>
              <p style={{ fontWeight: "700", color: "#f87171", fontSize: "14px", marginBottom: "5px" }}>⚠ Error</p>
              <p style={{ color: "rgba(248,113,113,0.78)", fontSize: "14px", lineHeight: 1.55 }}>{error}</p>
            </div>
          )}

          {/* ── FOOTER ── */}
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.55)"}
              onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.25)"}
            >
              🐙 View on GitHub
            </a>
          </div>

        </div>
      </div>
    </>
  );
}
