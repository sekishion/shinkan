import { createClient } from "@supabase/supabase-js";
import type { Circle, CircleType, Category, Campus, ShinkanEvent } from "./types";
import { generateTags, type Tag } from "./utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

/** 団体名から安定したIDを生成（sheets.tsと同じロジック） */
function nameToId(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return "c" + Math.abs(hash).toString(36);
}

interface DbCircle {
  name: string;
  type: string;
  category: string;
  campus: string;
  description: string;
  activity_schedule: string;
  fee: string | null;
  member_count: string | null;
  gender_ratio: string | null;
  multi_club_ok: boolean;
  notes: string | null;
  tags: string[];
  line_add_url: string | null;
  apply_url: string | null;
  x_url: string | null;
  instagram_url: string | null;
  events: { date: string; time: string; location: string; description: string }[];
}

export async function fetchSupabaseCircles(): Promise<Circle[]> {
  const { data, error } = await supabase
    .from("circles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  // 同名サークルの最新のみ採用
  const deduped = new Map<string, DbCircle>();
  for (const row of data as DbCircle[]) {
    if (!deduped.has(row.name)) deduped.set(row.name, row);
  }

  return Array.from(deduped.values()).map((row) => {
    const events: ShinkanEvent[] = (row.events || []).map(
      (ev: { date: string; time: string; location: string; description: string }) => ({
        date: ev.date,
        time: ev.time,
        location: ev.location,
        description: ev.description,
      }),
    );

    const circle: Circle = {
      id: nameToId(row.name),
      name: row.name,
      type: row.type as CircleType,
      category: row.category as Category,
      campus: row.campus as Campus,
      description: row.description,
      activitySchedule: row.activity_schedule,
      fee: row.fee || undefined,
      memberCount: row.member_count || undefined,
      genderRatio: row.gender_ratio || undefined,
      multiClubOk: row.multi_club_ok,
      notes: row.notes || undefined,
      tags: row.tags || [],
      lineAddUrl: row.line_add_url || undefined,
      applyUrl: row.apply_url || undefined,
      sns: {
        x: row.x_url || undefined,
        instagram: row.instagram_url || undefined,
      },
      events,
    };

    // 自動タグをマージ
    const auto = generateTags(circle);
    circle.tags = Array.from(new Set([...circle.tags, ...auto])) as Tag[];

    return circle;
  });
}
