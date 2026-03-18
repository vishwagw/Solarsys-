import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolarSense — AI Solar Design Platform",
  description: "Analyze geospatial & satellite data to design optimal solar panel systems",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
