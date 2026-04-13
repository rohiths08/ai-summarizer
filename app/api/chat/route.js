import { NextResponse } from "next/server";

const HF_MODEL = "Qwen/Qwen2.5-1.5B-Instruct";
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/v1/chat/completions`;

export async function POST(req) {
  try {
    const { articleText, messages } = await req.json();

    if (!articleText) {
      return NextResponse.json(
        { error: "No article text provided." },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    if (!process.env.HF_API_KEY) {
      return NextResponse.json(
        { error: "Hugging Face API key not configured." },
        { status: 500 }
      );
    }

    // Truncate article for context window
    const maxContextLen = 800;
    let contextText = articleText.replace(/\s+/g, " ").trim();
    if (contextText.length > maxContextLen) {
      const cut = contextText.lastIndexOf(".", maxContextLen);
      contextText = contextText.substring(
        0,
        cut > maxContextLen * 0.7 ? cut + 1 : maxContextLen
      );
    }

    const systemMessage = {
      role: "system",
      content: `You are a helpful assistant that answers questions based on the provided article. 
Stay focused on the article content. If a question goes beyond what is covered, acknowledge it clearly.
Be concise (2–4 sentences unless a longer answer is needed).

ARTICLE:
${contextText}`,
    };

    // Keep only last 6 messages to avoid token overflow
    const recentMessages = messages.slice(-6);
    const fullMessages = [systemMessage, ...recentMessages];

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: fullMessages,
        max_tokens: 350,
        temperature: 0.7,
        stream: false,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF API error:", errorText);
      return NextResponse.json(
        { error: "AI model error. Please try again." },
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

    const reply =
      result.choices?.[0]?.message?.content?.trim() ||
      "I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply, model: HF_MODEL });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { error: "Chat request failed. Please try again." },
      { status: 500 }
    );
  }
}
