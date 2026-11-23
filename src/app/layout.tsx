import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'BIG PROMPTER (Promptexa) — Multi-Model AI Prompt Engineering OS',
  description: 'You bring the idea. BIG PROMPTER engineers the prompt. L1–L4 production prompt engineering platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#07090e] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200 min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
