import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PantryPals - Learn to Cook Like a Pro",
  description: "Discover thousands of recipes from home cooks and professional chefs. Follow your favorite creators, save recipes, and build your cooking skills with step-by-step video guides.",
  keywords: ["recipes", "cooking", "food", "chef", "cooking videos", "meal planning", "culinary"],
  authors: [{ name: "PantryPals Team" }],
  openGraph: {
    title: "PantryPals - Learn to Cook Like a Pro",
    description: "Discover thousands of recipes from home cooks and professional chefs.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PantryPals - Learn to Cook Like a Pro",
    description: "Discover thousands of recipes from home cooks and professional chefs.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
