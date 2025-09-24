This is an AI Summarizer built with [Next.js](https://nextjs.org) that extracts and summarizes content from web articles.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env.local` file in the root directory and add your Hugging Face API key:
```
HF_API_KEY=your_hugging_face_api_key_here
```

To get a Hugging Face API key:
- Go to [huggingface.co](https://huggingface.co)
- Sign up/login and go to Settings > Access Tokens
- Create a new token and copy it to your `.env.local` file

## Getting Started

First, run the development server:

```bash
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.
