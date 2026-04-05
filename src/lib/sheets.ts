import type { Circle, ShinkanEvent, CircleType, Category, Campus } from "./types";
import { generateTags, type Tag } from "./utils";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1Lw7sNp3ovoYFPpIsOFVquo2W_qWE_q_wPG-9EUn_YrI/export?format=csv";

// ══════════════════════════════════════
// CSV パーサー（引用符・改行対応）
// ══════════════════════════════════════

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
        row.push(cell);
        cell = "";
        rows.push(row);
        row = [];
        if (ch === "\r") i++;
      } else if (ch === "\r") {
        row.push(cell);
        cell = "";
        rows.push(row);
        row = [];
      } else {
        cell += ch;
      }
    }
  }
  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

// ══════════════════════════════════════
// 正規化ロジック
// ══════════════════════════════════════

/** 団体名から安定したIDを生成（同名の再送信で同一ID） */
function nameToId(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return "c" + Math.abs(hash).toString(36);
}

/** キャンパス正規化: "多摩, 茗荷谷" → "複数" */
function normalizeCampus(raw: string): Campus {
  const trimmed = raw.trim();
  if (trimmed === "両方" || trimmed.includes(",")) return "複数";
  if (trimmed === "多摩") return "多摩";
  if (trimmed === "後楽園") return "後楽園";
  if (trimmed === "茗荷谷") return "茗荷谷";
  return "複数";
}

/** 時間表記を正規化: "18時～21時" → "18:00〜21:00", "14時30分〜17時30分" → "14:30〜17:30" */
function normalizeTime(raw: string): string {
  return raw
    .replace(/(\d+)時(\d+)分/g, (_, h: string, m: string) => `${h.padStart(2, "0")}:${m.padStart(2, "0")}`)
    .replace(/(\d+)時/g, (_, h: string) => `${h.padStart(2, "0")}:00`)
    .replace(/[～~]/g, "〜"); // チルダを全角に統一
}

/** 日付正規化: "2026/04/10" → "2026-04-10" */
function normalizeDate(raw: string): string {
  return raw.trim().replace(/\//g, "-");
}

/** 参加費を正規化 */
function normalizeFee(raw: string): string {
  if (!raw) return "";
  if (/無料|なし|^0[円えん]?$/.test(raw)) return "無料";
  // "2200円" → "¥2,200"
  const simple = raw.match(/^(\d+)\s*[円えん！!]?$/);
  if (simple) return "¥" + Number(simple[1]).toLocaleString();
  // "2000～3000円" or "2000～3000演出" (typo) → "¥2,000〜3,000"
  const range = raw.match(/(\d+)\s*[～~〜]\s*(\d+)\s*[円えん演]/);
  if (range) return "¥" + Number(range[1]).toLocaleString() + "〜" + Number(range[2]).toLocaleString();
  // 自由記述はそのまま
  return raw;
}

// ══════════════════════════════════════
// CSV行 → Circle 変換
// ══════════════════════════════════════

/**
 * CSV列マッピング:
 *  0: タイムスタンプ
 *  1: 団体名, 2: 団体区分, 3: カテゴリ, 4: 活動キャンパス
 *  5: 団体紹介文, 6: 通常の活動日時
 *  7: 会費, 8: 部員数, 9: 男女比, 10: 兼サーOK, 11: 雰囲気タグ, 12: 新入生に伝えたいこと
 *  13: LINE URL, 14: 入部申込URL, 15: X URL, 16: Instagram URL
 *  17: 新歓イベントあり？
 *  18+: イベントブロック（7列ずつ: 日付,時間,場所,内容,持ち物,参加費,追加確認）
 */
function rowToCircle(cols: string[]): Circle | null {
  const name = cols[1]?.trim();
  if (!name) return null;

  // タグ: "初心者歓迎, ゆるめ, イベント多め" → 配列
  const formTags = (cols[11]?.trim() || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean) as Tag[];

  // 兼サーOK
  const multiClubRaw = cols[10]?.trim();
  const multiClubOk =
    multiClubRaw === "はい" ? true : multiClubRaw === "いいえ" ? false : undefined;

  // イベント抽出（col 18 から 7列ずつ）
  const events: ShinkanEvent[] = [];
  const EVENT_START = 18;
  const BLOCK_SIZE = 7;

  for (let i = 0; i < 10; i++) {
    const base = EVENT_START + i * BLOCK_SIZE;
    const dateRaw = cols[base]?.trim();
    if (!dateRaw) break;

    const time = cols[base + 1]?.trim() || "";
    const location = cols[base + 2]?.trim() || "";
    const content = cols[base + 3]?.trim() || "";
    const belongings = cols[base + 4]?.trim() || "";
    const feeRaw = cols[base + 5]?.trim() || "";

    const fee = normalizeFee(feeRaw);
    let description = content;
    if (fee && fee !== "無料") {
      description = `${content}（参加費${fee}）`;
    } else if (fee === "無料") {
      description = `${content}（無料）`;
    }

    events.push({
      date: normalizeDate(dateRaw),
      time: normalizeTime(time),
      location,
      description,
    });
  }

  const circle: Circle = {
    id: nameToId(name),
    name,
    type: (cols[2]?.trim() || "サークル") as CircleType,
    category: (cols[3]?.trim() || "運動系") as Category,
    campus: normalizeCampus(cols[4] || ""),
    description: cols[5]?.trim().replace(/\n/g, "") || "",
    activitySchedule: cols[6]?.trim() || "",
    fee: cols[7]?.trim() || undefined,
    memberCount: cols[8]?.trim() || undefined,
    genderRatio: cols[9]?.trim() || undefined,
    multiClubOk,
    notes: cols[12]?.trim().replace(/\n/g, "") || undefined,
    tags: formTags,
    lineAddUrl: cols[13]?.trim() || undefined,
    applyUrl: cols[14]?.trim() || undefined,
    sns: {
      x: cols[15]?.trim() || undefined,
      instagram: cols[16]?.trim() || undefined,
    },
    events,
  };

  // 自動タグを生成してマージ
  const auto = generateTags(circle);
  circle.tags = Array.from(new Set([...circle.tags, ...auto])) as Tag[];

  return circle;
}

// ══════════════════════════════════════
// メインの取得関数
// ══════════════════════════════════════

export async function fetchCircles(): Promise<Circle[]> {
  const res = await fetch(SHEET_CSV_URL, {
    next: { revalidate: 300 }, // 5分キャッシュ
  });
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`);

  const text = await res.text();
  const rows = parseCSV(text);

  return rows
    .slice(1) // ヘッダー行をスキップ
    .map(rowToCircle)
    .filter((c): c is Circle => c !== null);
}
