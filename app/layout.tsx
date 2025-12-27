import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Video Ad Generator",
  description: "AI-powered product video ad creator with script generation and text-to-speech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
