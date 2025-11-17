import { NextResponse } from "next/server";

// Function to extract key points from text
function extractKeyPoints(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const keyPoints = [];

  // Keywords to identify important sentences
  const importantKeywords = [
    "important", "significant", "key", "main", "primary", "essential", "crucial",
    "major", "critical", "fundamental", "notable", "remarkable", "substantial",
    "according to", "research shows", "study found", "experts say", "data shows",
    "results indicate", "findings suggest", "analysis reveals", "report states"
  ];

  // Score sentences based on keyword presence & other heuristics
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();

    // Higher score for sentences with important keywords
    importantKeywords.forEach(keyword => {
      if (lowerSentence.includes(keyword)) score += 2;
    });

    // Score for statistics/numbers
    if (/\d+%|\d+\.\d+|\$\d+|million|billion|thousand/.test(sentence)) {
      score += 3;
    }

    // Score for early sentences
    if (index < sentences.length * 0.3) {
      score += 1;
    }

    // Score for longer content-rich sentences
    if (sentence.length > 80) {
      score += 1;
    }

    return { sentence: sentence.trim(), score, index };
  });

  // Sort & take best 4–6 sentences
  const topSentences = scoredSentences
    .filter(item => item.score > 0 && item.sentence.length > 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .sort((a, b) => a.index - b.index);

  return topSentences.map(item => item.sentence);
}

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No text provided for summarization." },
        { status: 400 }
      );
    }

    if (!process.env.HF_API_KEY) {
      return NextResponse.json(
        { error: "Hugging Face API key not configured. Please add HF_API_KEY to your .env.local file." },
        { status: 500 }
      );
    }

    // Preprocess text for faster summarization
    const maxLength = 800;
    let processedText = text.trim();

    processedText = processedText.replace(/\s+/g, " ").replace(/\n+/g, " ");

    if (processedText.length > maxLength) {
      processedText = processedText.substring(0, maxLength);

      const lastPeriod = processedText.lastIndexOf(".");
      const lastExclamation = processedText.lastIndexOf("!");
      const lastQuestion = processedText.lastIndexOf("?");

      const lastSentence = Math.max(lastPeriod, lastExclamation, lastQuestion);

      if (lastSentence > maxLength * 0.7) {
        processedText = processedText.substring(0, lastSentence + 1);
      }
    }

    if (processedText.length < 100) {
      return NextResponse.json(
        { error: "Text is too short for meaningful summarization. Please try a longer article." },
        { status: 400 }
      );
    }

    // Retry logic
    let response;
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await fetch(
          "https://router.huggingface.co/hf-inference/models/sshleifer/distilbart-cnn-12-6",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.HF_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: processedText }),
            signal: AbortSignal.timeout(30000),
          }
        );

        break; // Successful call
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt} failed:`, error.message);

        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (!response) throw lastError;

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", errorText);

      return NextResponse.json(
        { error: "Failed to get response from summarization service." },
        { status: response.status }
      );
    }

    const result = await response.json();

    if (result.error) {
      console.error("Hugging Face API returned error:", result.error);

      return NextResponse.json(
        { error: "Summarization service error: " + result.error },
        { status: 500 }
      );
    }

    const summary = result[0]?.summary_text || "No summary available";
    const keyPoints = extractKeyPoints(processedText);

    return NextResponse.json({
      summary,
      keyPoints,
      stats: {
        wordCount: processedText.split(" ").length,
        originalLength: text.length,
        processedLength: processedText.length,
      }
    });

  } catch (err) {
    console.error("Summarization error:", err);

    return NextResponse.json(
      { error: "Failed to summarize text." },
      { status: 500 }
    );
  }
}
