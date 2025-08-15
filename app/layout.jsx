export const metadata = {
  title: "Ravchamo – What should I eat?",
  description: "Lightweight, mobile-first food recommender MVP for Tbilisi.",
};

import "./globals.css";
import LangProvider from "./ui/LangProvider";
import LanguageToggle from "./ui/LanguageToggle";

export default function RootLayout({ children }) {
  return (
    <html lang="ka">
      <body className="min-h-screen text-gray-900">
        <LangProvider>
          <div className="max-w-md mx-auto px-4 py-6">
            {/* Header with language switch */}
            <header className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg">Ravchamo</div>
              <LanguageToggle />
            </header>

            {children}
          </div>

          <div className="max-w-md mx-auto px-4 pb-
