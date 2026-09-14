import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import 'leaflet/dist/leaflet.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "NTVS Delivery — Rider Onboarding",
  description: "Nouradine Top Cash Ventures — rider onboarding and admin portal.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}