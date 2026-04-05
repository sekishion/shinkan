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

// ─── アクティビティ検出 ───

const ACTIVITY_MAP: [RegExp, string, string][] = [
  // [パターン, ラベル, 絵文字]
  [/テニス/, "テニス", "🎾"],
  [/サッカー|フットサル/, "サッカー", "⚽"],
  [/バスケ/, "バスケ", "🏀"],
  [/バレー(?!ビーチ)/, "バレーボール", "🏐"],
  [/野球|ソフトボール/, "野球", "⚾"],
  [/バドミントン/, "バドミントン", "🏸"],
  [/卓球/, "卓球", "🏓"],
  [/ラグビー/, "ラグ��ー", "🏉"],
  [/アメフト/, "アメフト", "🏈"],
  [/ハンドボール/, "ハンドボール", "🤾"],
  [/ラクロス/, "ラクロス", "🥍"],
  [/陸上|マラソン|駅伝/, "陸上", "🏃"],
  [/水泳|競泳/, "水泳", "🏊"],
  [/ダンス|チアリーディング|チア/, "ダンス", "💃"],
  [/よさこい/, "よさこい", "🪭"],
  [/ゴルフ/, "ゴルフ", "⛳"],
  [/スキー|スノボ|スノーボード/, "ウインター", "🎿"],
  [/登山|山岳|ワンゲル|ハイキング/, "登山", "🏔️"],
  [/自転車|サイクリング/, "自転車", "🚴"],
  [/剣道/, "剣道", "🤺"],
  [/柔道/, "柔道", "🥋"],
  [/空手|合気道|少林寺|拳法|武道|格闘/, "武道", "🥋"],
  [/弓道|アーチェリー/, "弓道", "🏹"],
  [/ボート|ヨット|セーリング/, "ボート", "🚣"],
  [/バンド|軽音|音楽/, "音楽", "🎸"],
  [/アカペラ|合唱|コーラス/, "合唱", "🎤"],
  [/吹奏楽|オーケストラ|管弦楽/, "吹奏楽", "🎺"],
  [/ピアノ|ジャズ/, "音楽", "🎹"],
  [/演劇|劇団|ミュージカル/, "演劇", "🎭"],
  [/写真/, "写���", "📷"],
  [/映画|映像/, "映画", "🎬"],
  [/美術|アート|絵|イラスト|デザイン/, "美術", "🎨"],
  [/茶道/, "茶道", "🍵"],
  [/書道/, "書道", "✒️"],
  [/料理|クッキング/, "料理", "🍳"],
  [/旅行|トラベル/, "旅行", "✈️"],
  [/ボランティア|国際協力|社会貢献/, "ボランティア", "🤝"],
  [/プログラミング|IT|ハッカソン|エンジニア|開発/, "プログラミング", "💻"],
  [/クイズ/, "クイズ", "��"],
  [/麻雀/, "麻雀", "🀄"],
  [/ボードゲーム|カードゲーム/, "ゲーム", "����"],
  [/天文|星空|天体|プラネタリウム/, "天文", "🔭"],
  [/鉄道/, "鉄道", "🚃"],
  [/釣り|フィッシング/, "釣り", "🎣"],
  [/キャンプ|アウトドア/, "アウトドア", "🏕️"],
  [/eスポーツ|ゲーム|LoL|Apex/, "eスポーツ", "🎮"],
  [/観戦/, "スポーツ観戦", "��"],
  [/漫画|アニメ|コスプレ|サブカル/, "漫画・アニメ", "📚"],
  [/英語|英会話|ESS|留学/, "英語", "🌍"],
  [/法律|法学|模擬裁判/, "法律", "⚖️"],
  [/経済|株|投資|証券|金融|ファイナンス|FP/, "経済", "📈"],
  // ── 学術・研究（追加） ──
  [/会計|簿記|税/, "会計", "🧮"],
  [/政治|政策|行政|自治/, "政治", "🏛️"],
  [/歴史|史学|考古/, "歴史", "📜"],
  [/哲学|思想|倫理/, "哲学", "🤔"],
  [/心理|カウンセリング/, "心理", "🧠"],
  [/文学|文芸|小説|俳句|短歌|詩|読書/, "文芸", "📖"],
  [/語学|外国語|中国語|韓国語|フランス語|ドイツ語|スペイン語/, "語学", "🗣️"],
  [/数学|物理|化学|生物|理学/, "理学", "🔬"],
  [/医療|看護|福祉|手話/, "福祉", "🏥"],
  [/教育|塾|家庭教師|学習支援/, "教育", "🎓"],
  [/環境|エコ|SDGs|サステナ/, "環境", "🌱"],
  [/国際|異文化|多文化|グローバル/, "国際", "🌐"],
  [/起業|ビジネス|マーケティング|スタートアップ/, "ビジネス", "💼"],
  [/新聞|ジャーナリズム|報道|メディア/, "メディア", "📰"],
  [/放送|ラジオ|配信/, "放送", "📻"],
  [/弁論|ディベート|スピーチ/, "弁論", "🎙️"],
  [/落語|お笑い|漫才|コント/, "お笑い", "😂"],
  // ── ライフスタイル（追加） ──
  [/農業|園芸|ガーデニング/, "園芸", "🌻"],
  [/ファッション|服/, "ファッション", "👗"],
  [/ペット|動物|犬|猫/, "動物", "🐾"],
  [/宗教|聖書|仏教|キリスト/, "宗教", "🙏"],
  // ── フォールバック（最後に判定） ──
  [/研究会|研究/, "研究", "📝"],
];

/** カテゴリに基づくフォールバックアイコン */
const CATEGORY_FALLBACK: Record<string, { label: string; emoji: string }> = {
  "運動系": { label: "運動", emoji: "🏃" },
  "文化系": { label: "文化", emoji: "📖" },
};

/** サークルの名前・説明から主なアクティビティを検出 */
export function detectActivity(name: string, description: string, category?: string): { label: string; emoji: string } | null {
  const text = `${name} ${description}`;
  for (const [pattern, label, emoji] of ACTIVITY_MAP) {
    if (pattern.test(text)) return { label, emoji };
  }
  // フォールバック: カテゴリに基づくデフォルトアイコン
  if (category && CATEGORY_FALLBACK[category]) {
    return CATEGORY_FALLBACK[category];
  }
  return null;
}

/** ACTIVITY_MAPからユニークなラベル一覧を取得 */
export function getActivityLabels(): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const [, label] of ACTIVITY_MAP) {
    if (!seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }
  return labels;
}

// ─── 大カテゴリ（ジャンルグループ） ───

export interface GenreGroup {
  label: string;
  emoji: string;
  genres: string[];  // ACTIVITY_MAP のラベルに対応
}

export const GENRE_GROUPS: GenreGroup[] = [
  {
    label: "球技",
    emoji: "⚽",
    genres: ["テニス", "サッカー", "バスケ", "バレーボール", "野球", "バドミントン", "卓球", "ラグビー", "アメフト", "ハンドボール", "ラクロス"],
  },
  {
    label: "スポーツ他",
    emoji: "🏃",
    genres: ["陸上", "水泳", "ダンス", "よさこい", "ゴルフ", "ウインター", "登山", "自転車", "剣道", "柔道", "武道", "弓道", "ボート", "探検"],
  },
  {
    label: "音楽・舞台",
    emoji: "🎵",
    genres: ["音楽", "合唱", "吹奏楽", "演劇", "お笑い"],
  },
  {
    label: "アート・文化",
    emoji: "🎨",
    genres: ["写真", "映画", "美術", "茶道", "書道"],
  },
  {
    label: "学術・研究",
    emoji: "📚",
    genres: ["法律", "経済", "会計", "政治", "歴史", "哲学", "心理", "文芸", "語学", "英語", "理学", "教育", "弁論", "メディア", "放送", "研究"],
  },
  {
    label: "趣味・遊び",
    emoji: "🎮",
    genres: ["料理", "旅行", "プログラミング", "クイズ", "麻雀", "ゲーム", "天文", "鉄道", "釣り", "アウトドア", "eスポーツ", "漫画・アニメ", "スポーツ観戦", "園芸", "ファッション", "動物"],
  },
  {
    label: "社会・国際",
    emoji: "🌍",
    genres: ["ボランティア", "国際", "環境", "福祉", "ビジネス", "宗教"],
  },
];

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
