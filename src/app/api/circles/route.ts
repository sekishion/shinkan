import { fetchCircles } from "@/lib/sheets";
import { fetchSupabaseCircles } from "@/lib/supabase-circles";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [sheetCircles, dbCircles] = await Promise.all([
      fetchCircles(),
      fetchSupabaseCircles(),
    ]);

    // 名前で重複排除（Supabase優先 = より新しいデータ）
    const merged = new Map<string, (typeof sheetCircles)[number]>();
    for (const c of sheetCircles) merged.set(c.name, c);
    for (const c of dbCircles) merged.set(c.name, c);

    return NextResponse.json(Array.from(merged.values()));
  } catch (error) {
    console.error("Failed to fetch circles:", error);
    return NextResponse.json([], { status: 500 });
  }
}
