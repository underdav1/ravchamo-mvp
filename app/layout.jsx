export const metadata = {
  title: "Ravchamo – What should I eat?",
  description: "Lightweight, mobile-first food recommender MVP for Tbilisi.",
};

import "./globals.css";
import ThemeProvider from "./ui/ThemeProvider";
import LangProvider from "./ui/LangProvider";
import LanguageToggle from "./ui/LanguageToggle";
import ThemeToggle from "./ui/ThemeToggle";

// NEW: import Analytics
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html lang="ka">
      <body className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <ThemeProvider>
          <LangProvider>
            <div className="max-w-md mx-auto px-4 py-6">
              <header className="flex items-center justify-between mb-4">
                <div className="font-semibold text-lg">Ravchamo</div>
                <div className="flex items-center gap-2">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </header>

              {children}

              <footer className="mt-8 text-sm text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} Ravchamo — MVP.
                <br />
                <span>We use your location only in the browser to estimate distance.</span>
              </footer>
            </div>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
