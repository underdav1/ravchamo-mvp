export const metadata = {
  title: "Ravchamo — What should I eat?",
  description: "Lightweight, mobile-first food recommender MVP for Tbilisi."
};
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-gray-900">
        <div className="max-w-md mx-auto px-4 py-6">{children}</div>
        <div className="max-w-md mx-auto px-4 pb-16 pt-6">
          <footer>
            © {new Date().getFullYear()} Ravchamo — MVP. <br/>
            <span>We use your location only in the browser to estimate distance.</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
