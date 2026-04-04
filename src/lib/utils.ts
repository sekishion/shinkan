export const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

export function getWeekDates(baseDate: Date): Date[] {
  const monday = new Date(baseDate);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/** 月カレンダー用: 6週分（42日）の日付配列を返す。月曜始まり。 */
export function getMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
  const gridStart = new Date(year, month, 1 + mondayOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isToday(d: Date): boolean {
  return toISO(d) === toISO(new Date());
}

// ─── タグ定義 ───

/** 全タグ一覧（UI表示順） */
export const ALL_TAGS = [
  // フォーム「サークルの雰囲気」選択肢（回答からそのまま取得）
  "初心者歓迎",
  "ガチ・経験者向け",
  "ゆるめ",
  "イベント多め",
  // 自動推定タグ（generateTags で付与）
  "週1〜2",
  "週3以上",
  "無料",
  "少人数",
  "大人数",
  "飲み会あり",
  "兼サーOK",
  "インカレ",
] as const;

export type Tag = (typeof ALL_TAGS)[number];

/** Circleのフィールドからタグを自動生成 */
export function generateTags(circle: {
  description: string;
  notes?: string;
  activitySchedule: string;
  fee?: string;
  memberCount?: string;
  events: { description: string }[];
}): Tag[] {
  const tags: Tag[] = [];
  const text = `${circle.description} ${circle.notes || ""}`.toLowerCase();

  // 雰囲気
  if (/初心者|未経験|経験不問|経験者も|苦手でも/.test(text)) tags.push("初心者歓迎");
  if (/本格|インカレ|リーグ|大会出場|選手権/.test(text)) tags.push("ガチ・経験者向け");
  if (/ゆる[くい]|のんびり|まったり|自由/.test(text)) tags.push("ゆるめ");

  // 活動頻度: activityScheduleから曜日数を数える
  const dayMatches = circle.activitySchedule.match(/[月火水木金土日]/g);
  const dayCount = dayMatches ? new Set(dayMatches).size : 0;
  if (/不定期|月[12]回/.test(circle.activitySchedule) || dayCount <= 2) {
    tags.push("週1〜2");
  } else if (dayCount >= 3) {
    tags.push("週3以上");
  }

  // 費用
  if (circle.fee && /なし|無料|0円|¥0/.test(circle.fee)) {
    tags.push("無料");
  }

  // 人数
  if (circle.memberCount) {
    const numMatch = circle.memberCount.match(/(\d+)/);
    if (numMatch) {
      const count = parseInt(numMatch[1], 10);
      if (count <= 30) tags.push("少人数");
      if (count >= 50) tags.push("大人数");
    }
  }

  // イベント内容から
  const eventTexts = circle.events.map((e) => e.description).join(" ");
  if (/コンパ|飲み会|懇親会/.test(eventTexts)) tags.push("飲み会あり");

  // 兼サーOK
  if (/兼サー|掛け持ち|兼部|他サークル/.test(text)) tags.push("兼サーOK");

  // イベント多め（イベント4件以上 or テキストにイベント系キーワード）
  if (circle.events.length >= 4 || /BBQ|ハロウィン|クリスマス|合宿|旅行|イベント盛り/.test(text)) {
    tags.push("イベント多め");
  }

  // インカレ
  if (/インカレ|他大/.test(text)) tags.push("インカレ");

  return tags;
}

/** イベント日までのカウントダウンラベル */
export function countdownLabel(eventDate: string): { text: string; urgent: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(eventDate);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { text: "", urgent: false };
  if (diff === 0) return { text: "今日!", urgent: true };
  if (diff === 1) return { text: "明日!", urgent: true };
  if (diff <= 7) return { text: `あと${diff}日`, urgent: false };
  return { text: "", urgent: false };
}

/** "12:00〜13:00" → { start: 12, end: 13 } / "18:30〜" → { start: 18.5, end: 19.5 } */
export function parseTimeRange(time: string): { start: number; end: number } {
  const parts = time.split("〜");
  const startStr = parts[0].trim();
  const endStr = parts[1]?.trim();

  const parseHM = (s: string): number => {
    const [h, m] = s.split(":").map(Number);
    return h + (m || 0) / 60;
  };

  const start = parseHM(startStr);
  const end = endStr && endStr.includes(":") ? parseHM(endStr) : start + 1;
  return { start, end: end > start ? end : start + 1 };
}
