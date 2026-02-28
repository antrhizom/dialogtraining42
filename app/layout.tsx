import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sprachtrainerin — Deutsch üben",
  description:
    "Interaktive Sprachtrainerin für Deutsch. Übe Dialoge zu Alltagssituationen mit KI-Unterstützung.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
