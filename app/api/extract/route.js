import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url || !url.trim()) {
      return NextResponse.json({ error: "No URL provided." }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Summarizer/1.0)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${response.status} ${response.statusText}` }, { status: response.status });
    }

    const html = await response.text();

    if (!html || html.trim().length === 0) {
      return NextResponse.json({ error: "No content found at the provided URL." }, { status: 400 });
    }

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent || article.textContent.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract readable content from the URL." }, { status: 400 });
    }

    return NextResponse.json({ text: article.textContent.trim() });
  } catch (err) {
    console.error("Content extraction error:", err);
    
    // Provide more specific error messages
    if (err.name === 'AbortError') {
      return NextResponse.json({ error: "Request timeout - the URL took too long to respond." }, { status: 408 });
    }
    
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      return NextResponse.json({ error: "Could not connect to the URL. Please check if the URL is accessible." }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: "Failed to extract content from the URL. Please try a different article.", 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    }, { status: 500 });
  }
}