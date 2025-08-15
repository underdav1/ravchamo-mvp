"use client";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title="Toggle dark mode"
      className="px-3 py-1 text-sm rounded-md border bg-white hover:bg-gray-50
                 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      {isDark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
