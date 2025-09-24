import "./globals.css";

export const metadata = {
  title: "AI Summarizer",
  description: "Paste a URL to get a concise AI-generated summary",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}