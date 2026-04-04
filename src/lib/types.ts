export type Category = "運動系" | "文化系";
export type CircleType = "部活" | "サークル" | "その他";
export type Campus = "多摩" | "後楽園" | "両方";

export interface ShinkanEvent {
  /** ISO形式 "2026-04-07" */
  date: string;
  time: string;
  location: string;
  description: string;
}

export interface Circle {
  id: string;
  name: string;
  type: CircleType;
  category: Category;
  campus: Campus;
  description: string;
  events: ShinkanEvent[];
  activitySchedule: string;
  fee?: string;
  memberCount?: string;
  genderRatio?: string;
  multiClubOk?: boolean;
  belongings?: string;
  notes?: string;
  applyUrl?: string;
  /** 有料プロモーション枠（trueだとカレンダー上部に目立つ表示） */
  featured?: boolean;
  /** 自動付与タグ（活動頻度・雰囲気・費用帯など） */
  tags: string[];
  /** LINE追加URL（サークル側の最重要導線） */
  lineAddUrl?: string;
  sns: {
    x?: string;
    instagram?: string;
  };
}

/** ユーザーが投稿する評価 */
export interface CircleReview {
  circleId: string;
  rating: number; // 1-5
  comment: string;
  timestamp: number;
}
