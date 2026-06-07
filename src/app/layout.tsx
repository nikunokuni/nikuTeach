import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "nikuTeach - オンライン家庭教師",
  description: "先生と生徒のためのオンライン家庭教師アプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
