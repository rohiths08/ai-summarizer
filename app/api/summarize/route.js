import { NextResponse } from "next/server";

const HF_MODEL = "Qwen/Qwen2.5-1.5B-Instruct";
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/v1/chat/completions`;

// Prompt templates per mode
const MODE_PROMPTS = {
  summary: {
    system:
      "You are an expert article analyst. Provide clear, concise, and accurate summaries. Write in a professional tone. Be direct — no preamble, no phrases like 'This article discusses'.",
    user: (text) =>
      `Summarize the following article in 3–5 sentences. Focus on the main argument, key findings, and conclusion.\n\nARTICLE:\n${text}\n\nSUMMARY:`,
  },
  bullets: {
    system:
      "You are an expert at extracting key insights from articles. Present information as a clean, numbered list. No intro sentence — just the list.",
    user: (text) =>
      `Extract exactly 5 key takeaways from the following article. Format strictly as:\n1. ...\n2. ...\n3. ...\n4. ...\n5. ...\n\nARTICLE:\n${text}\n\nKEY TAKEAWAYS:`,
  },
  eli5: {
    system:
      "You are a friendly teacher who explains complex topics in very simple language. Use short sentences, simple words, and relatable analogies. Avoid jargon entirely.",
    user: (text) =>
      `Explain what this article is about as if you're talking to someone with no background knowledge on this topic. Keep it short (3–4 sentences), fun, and very easy to understand.\n\nARTICLE:\n${text}\n\nSIMPLE EXPLANATION:`,
  },
  sentiment: {
    system:
      "You are an expert at analyzing tone, bias, and sentiment in written content. You provide objective, evidence-based analysis.",
    user: (text) =>
      `Analyze the sentiment and tone of the following article. First state the overall sentiment (Positive / Negative / Neutral / Mixed). Then in 2–3 sentences, explain why, citing specific language choices, framing, or word choices from the text.\n\nARTICLE:\n${text}\n\nSENTIMENT ANALYSIS:`,
  },
};

async function callQwen(messages) {
  let response;
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: HF_MODEL,
          messages,
          max_tokens: 512,
          temperature: 0.7,
          stream: false,
        }),
        signal: AbortSignal.timeout(60000),
      });
      break;
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed:`, error.message);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
      }
    }
  }

  if (!response) throw lastError;
  return response;
}

export async function POST(req) {
  try {
    const { text, mode = "summary" } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    if (!process.env.HF_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Hugging Face API key not configured. Add HF_API_KEY to your .env.local file.",
        },
        { status: 500 }
      );
    }

    if (text.length < 100) {
      return NextResponse.json(
        { error: "Text is too short for meaningful analysis. Please try a longer article." },
        { status: 400 }
      );
    }

    // Truncate & clean for free-tier limits (~1000 chars)
    const maxLen = 1000;
    let processedText = text.replace(/\s+/g, " ").trim();
    if (processedText.length > maxLen) {
      const cut = processedText.lastIndexOf(".", maxLen);
      processedText = processedText.substring(
        0,
        cut > maxLen * 0.7 ? cut + 1 : maxLen
      );
    }

    const prompt = MODE_PROMPTS[mode] || MODE_PROMPTS.summary;
    const messages = [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user(processedText) },
    ];

    const response = await callQwen(messages);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF API error:", errorText);
      return NextResponse.json(
        { error: "AI model returned an error. Please try again shortly." },
        { status: response.status }
      );
    }

    const result = await response.json();

    if (result.error) {
      return NextResponse.json(
        { error: "AI service error: " + result.error },
        { status: 500 }
      );
    }

    const output =
      result.choices?.[0]?.message?.content?.trim() ||
      "No output generated.";

    return NextResponse.json({
      output,
      mode,
      model: HF_MODEL,
      stats: {
        wordCount: processedText.split(" ").length,
        originalLength: text.length,
        processedLength: processedText.length,
      },
    });
  } catch (err) {
    console.error("Summarization error:", err);
    return NextResponse.json(
      { error: "Failed to process text. Please try again." },
      { status: 500 }
    );
  }
}
