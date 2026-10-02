import "./globals.css";
import 'leaflet/dist/leaflet.css';

export const metadata = {
  title: "NTVL Delivery — Rider Onboarding",
  description: "Nouradine Top Cash Logistics — rider onboarding and admin portal.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}