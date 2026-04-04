import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "中大新歓ナビ | 2026年度 新歓イベントまとめ",
  description: "中央大学の新歓イベント・サークル情報を一覧でチェック。カレンダーで予定を確認、気になるサークルをキープしよう。",
  openGraph: {
    title: "中大新歓ナビ",
    description: "中央大学の新歓イベント・サークル情報をまとめてチェック",
    type: "website",
    locale: "ja_JP",
    siteName: "中大新歓ナビ",
  },
  twitter: {
    card: "summary",
    title: "中大新歓ナビ",
    description: "中央大学の新歓イベント・サークル情報をまとめてチェック",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "中大新歓ナビ",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
