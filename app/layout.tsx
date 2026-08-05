import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Court — Padel League, Egypt",
  description:
    "Egypt's competitive padel community. Join weekly sessions, climb the season leaderboard, and win real prizes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
