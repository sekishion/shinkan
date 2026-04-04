import type { Circle } from "./types";
import { generateTags, type Tag } from "./utils";

/** フォーム回答タグ + 自動推定タグをマージ */
function mergeTags(circle: Circle): Circle {
  const auto = generateTags(circle);
  const merged = Array.from(new Set([...circle.tags, ...auto])) as Tag[];
  return { ...circle, tags: merged };
}

const raw: Circle[] = [
  // ══════════════════════════════════════
  //  運動系
  // ══════════════════════════════════════
  {
    id: "c01",
    name: "一期一笑",
    type: "サークル",
    category: "運動系",
    campus: "複数",
    description:
      "中大唯一のよさこいサークルです！毎年夏に高知県で行われるよさこい祭りに参加しています！人生1アツイ夏を一緒に過ごしてみませんか？",
    activitySchedule:
      "5〜8月までは週2回、多摩キャンパスと茗荷谷キャンパスで練習。8月のよさこい祭り参加。後期はディズニー・スノボ・スポーツ大会など。",
    fee: "年会費¥5,000",
    memberCount: "約120名",
    genderRatio: "男4:女6",
    multiClubOk: true,
    notes:
      "よさこい初心者しかいません！音楽にノる心さえあれば絶対楽しめます！とにかく人の愛と暖かさに溢れるサークルです！一緒に高知でかましましょう！！！！！",
    events: [
      {
        date: "2026-04-10",
        time: "19:00〜21:00",
        location: "おすすめ屋 立川店",
        description: "新歓コンパ（参加費¥2,200）",
      },
      {
        date: "2026-04-17",
        time: "18:30〜21:30",
        location: "大馬鹿地蔵 池袋西口店",
        description: "池袋コンパ（参加費¥2,800）",
      },
      {
        date: "2026-04-26",
        time: "11:00〜13:00 / 14:00〜16:00",
        location: "高幡不動 河川敷",
        description: "BBQ（参加費¥500）",
      },
    ],
    tags: ["初心者歓迎", "ゆるめ", "イベント多め"],
    lineAddUrl: "https://line.me/ti/g/bcr4gKy8jf",
    applyUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLScWWw9_daEveOIBx8p9NKvDrmLS77e7fJ7cXVwKditQ49p3oA/viewform",
    sns: {
      instagram:
        "https://www.instagram.com/1go1e19?igsh=NjFiYmIxM3I3eDJx&utm_source=qr",
    },
  },
  {
    id: "c02",
    name: "SunnySide",
    type: "サークル",
    category: "運動系",
    campus: "複数",
    description:
      "SunnySideは多摩、都心を交互に週5回のテニス練習をしています！また、週末には毎回イベントと、年三回の合宿があります！",
    activitySchedule:
      "週5回（多摩・都心交互）、イベント週1、合宿年3回",
    fee: "前期¥5,000 + 白定費¥3,000",
    memberCount: "約120名",
    genderRatio: "男5:女5",
    multiClubOk: true,
    notes:
      "初心者大歓迎！半数が初心者で、未経験でも安心です！経験者にはレギュラーがお勧め！めちゃくちゃレベル高い練習で、レベルアップ間違いなし！",
    events: [
      {
        date: "2026-04-12",
        time: "14:30〜18:00",
        location: "浅草周辺",
        description: "食べ歩きイベント（参加費¥500）",
      },
      {
        date: "2026-04-18",
        time: "14:30〜18:00",
        location: "みなとみらい周辺",
        description: "食べ歩きイベント（参加費¥500）",
      },
      {
        date: "2026-04-25",
        time: "16:00〜22:00",
        location: "立飛ビーチ",
        description: "BBQ＋ビーチバレー（参加費¥2,500）",
      },
    ],
    tags: ["初心者歓迎", "ガチ・経験者向け", "ゆるめ", "イベント多め"],
    lineAddUrl: undefined,
    applyUrl: undefined,
    sns: {},
  },
] satisfies Circle[];

export const circles: Circle[] = raw.map(mergeTags);
