import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Risk Co. - Prijava štete na živini",
  description: "Aplikacija za prijavu štete na živini",
  keywords: ["Risk Co", "prijava štete", "živina", "osiguranje"],
  authors: [{ name: "Risk Co" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Risk Co. - Prijava štete na živini",
    description: "Aplikacija za prijavu štete na živini",
    url: "https://prijava-zivina.netlify.app",
    siteName: "Risk Co",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
