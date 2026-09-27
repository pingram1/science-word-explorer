import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AccessibilityProvider } from "@/components/layout/AccessibilityProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Science Word Explorer",
  description:
    "Structured literacy vocabulary instruction for 5th-grade science — explore words, master concepts, and grow as a scientist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AccessibilityProvider>{children}</AccessibilityProvider>
      </body>
    </html>
  );
}
