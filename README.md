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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
