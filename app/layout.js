import "./globals.css";

export const metadata = {
  title: "Smart Summarizer - AI Article Analysis",
  description: "AI-powered article analysis with summary and key insights extraction",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <header className="bg-gray-100 p-4 shadow-md">
          <h1 className="text-2xl font-bold">Smart AI Summarizer</h1>
          <nav className="mt-2">
            <a
              href="https://github.com/rohiths08/ai-summarizer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline mr-4"
            >
              GitHub
            </a>
            <a
              href="https://ai-summarizer-nine-beige.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Live Demo
            </a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
