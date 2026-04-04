import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fff5f6 0%, #ffffff 50%, #fef1f3 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "80px",
              fontWeight: 800,
              color: "#d4546a",
              letterSpacing: "-2px",
            }}
          >
            白門ナビ
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 500,
              color: "#6b7280",
            }}
          >
            中央大学 新歓イベントまとめ 2026
          </div>
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#eef4ff",
                padding: "12px 24px",
                borderRadius: "999px",
                fontSize: "22px",
                color: "#5b8def",
                fontWeight: 600,
              }}
            >
              カレンダー
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#f3f0ff",
                padding: "12px 24px",
                borderRadius: "999px",
                fontSize: "22px",
                color: "#9b7aed",
                fontWeight: 600,
              }}
            >
              サークル検索
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#fffaed",
                padding: "12px 24px",
                borderRadius: "999px",
                fontSize: "22px",
                color: "#f0a832",
                fontWeight: 600,
              }}
            >
              キープ
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
