import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "@/components/Navigation";
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
  title: "Riding — Training Dashboard",
  description: "16-week training plan for your 6-day stage race",
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
      <body className="min-h-full">
        <Navigation />
        <main className="lg:pl-[72px] pb-20 lg:pb-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
