import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SL Bus Finder | Find Bus Routes in Colombo",
  description: "The easiest way to find bus routes in Colombo and Western Province, Sri Lanka. Crowdsourced and community verified.",
  keywords: ["bus routes", "colombo", "sri lanka", "public transport", "bus finder"],
  authors: [{ name: "SL Bus Finder Team" }],
  openGraph: {
    title: "SL Bus Finder",
    description: "Find bus routes in Colombo easily",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Header />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
