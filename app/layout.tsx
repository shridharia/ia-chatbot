import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IA Digital Agent | Impact Analytics Chatbot",
  description: "Ask about Impact Analytics solutions, products, and services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
