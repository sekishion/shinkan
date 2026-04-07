import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// プリレンダHTMLがCDNに長時間キャッシュされ、calendar-view の useState 初期値
// (new Date().getDay() 等) がビルド時の日付で固定される問題を回避するため、
// ルート全体を動的レンダリング（SSR）に切り替える。
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "白門ナビ | 中央大学 新歓イベントまとめ 2026",
  description: "中央大学の新歓イベント・サークル情報を一覧でチェック。カレンダーで予定を確認、気になるサークルをキープしよう。",
  metadataBase: new URL("https://shinkan-eight.vercel.app"),
  openGraph: {
    title: "白門ナビ",
    description: "中央大学の新歓イベント・サークル情報をまとめてチェック",
    type: "website",
    locale: "ja_JP",
    siteName: "白門ナビ",
    url: "https://shinkan-eight.vercel.app",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "白門ナビ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "白門ナビ",
    description: "中央大学の新歓イベント・サークル情報をまとめてチェック",
    images: ["/api/og"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "白門ナビ",
  },
  manifest: "/manifest.json",
  other: {
    "application-name": "白門ナビ",
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
        <Analytics />
      </body>
    </html>
  );
}
