import { fetchCircles } from "@/lib/sheets";
import { NextResponse } from "next/server";

export const revalidate = 300; // 5分キャッシュ

export async function GET() {
  try {
    const circles = await fetchCircles();
    return NextResponse.json(circles);
  } catch (error) {
    console.error("Failed to fetch circles:", error);
    return NextResponse.json([], { status: 500 });
  }
}
