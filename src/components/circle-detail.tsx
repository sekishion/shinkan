"use client";

import { useEffect, useState } from "react";
import { Circle } from "@/lib/types";
import { DAY_NAMES } from "@/lib/utils";
import { StoredReview } from "@/lib/hooks";
import { XIcon, InstagramIcon, LineIcon } from "./icons";

export function CircleDetail({
  circle,
  isKept,
  onToggleKeep,
  onClose,
  reviews,
  averageRating,
  onAddReview,
}: {
  circle: Circle;
  isKept: boolean;
  onToggleKeep: () => void;
  onClose: () => void;
  reviews: StoredReview[];
  averageRating: number | null;
  onAddReview: (rating: number, comment: string) => void;
}) {
  const isSports = circle.category === "運動系";
  const badgeStyle = isSports ? "bg-sports-light text-sports" : "bg-culture-light text-culture";
  const featured = circle.featured;

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const submitReview = () => {
    if (newRating === 0) return;
    onAddReview(newRating, newComment);
    setShowReviewForm(false);
    setNewRating(0);
    setNewComment("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-t-3xl max-h-[88vh] flex flex-col shadow-xl">
        {/* ── ドラッグハンドル ── */}
        <div className="bg-white pt-3 pb-1 flex justify-center rounded-t-3xl shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* ── PRバナー（有料サークル） ── */}
        {featured && (
          <div className="mx-5 mb-2 bg-gradient-to-r from-chuo-light to-white rounded-xl px-3 py-2 border border-chuo/10">
            <div className="flex items-center gap-2">
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-chuo/10 text-chuo font-bold">PR</span>
              <span className="text-[11px] text-chuo/70 font-medium">注目サークル</span>
            </div>
          </div>
        )}

        {/* ── スクロール領域 ── */}
        <div className="flex-1 overflow-y-auto px-5">
          {/* ヘッダー */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <h2 className="text-xl font-bold text-gray-800">{circle.name}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* バッジ + 評価 */}
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${badgeStyle}`}>{circle.category}</span>
            <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-gray-50 text-gray-500">{circle.campus}</span>
            {circle.memberCount && <span className="text-[11px] text-gray-400">{circle.memberCount}</span>}
            {averageRating && (
              <span className="text-[11px] text-amber-500 font-semibold ml-auto">
                {"★".repeat(Math.round(averageRating))} {averageRating.toFixed(1)}
                <span className="text-gray-400 font-normal ml-0.5">({reviews.length}件)</span>
              </span>
            )}
          </div>

          <p className="text-[14px] text-gray-500 leading-relaxed mb-5">{circle.description}</p>

          {/* 基本情報 */}
          <div className="space-y-2 mb-5">
            <InfoCard emoji="🕐" label="活動日時" value={circle.activitySchedule} />
            {circle.fee && <InfoCard emoji="💰" label="部費" value={circle.fee} />}
            {circle.belongings && <InfoCard emoji="🎒" label="持ち物" value={circle.belongings} />}
            {circle.notes && <InfoCard emoji="💡" label="ひとこと" value={circle.notes} />}
          </div>

          {/* 新歓イベント */}
          {circle.events.length > 0 && (
            <div className="mb-5">
              <p className="text-[13px] font-semibold text-gray-600 mb-2">新歓イベント</p>
              <div className="space-y-2">
                {circle.events.map((ev, i) => {
                  const d = new Date(ev.date);
                  const label = `${d.getMonth() + 1}/${d.getDate()}(${DAY_NAMES[d.getDay()]})`;
                  return (
                    <div key={i} className="bg-chuo-light rounded-2xl p-3.5 border border-chuo/10">
                      <div className="text-[13px] font-semibold text-chuo">{label} {ev.time}</div>
                      <div className="text-[12px] text-gray-500 mt-0.5">📍 {ev.location} — {ev.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SNS */}
          {(circle.sns.x || circle.sns.instagram) && (
            <div className="flex items-center gap-2 mb-5">
              {circle.sns.x && (
                <a href={circle.sns.x} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-full text-[13px] text-gray-500">
                  <XIcon /> X
                </a>
              )}
              {circle.sns.instagram && (
                <a href={circle.sns.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-full text-[13px] text-gray-500">
                  <InstagramIcon /> Insta
                </a>
              )}
            </div>
          )}

          {/* シェアボタン */}
          <button
            onClick={() => {
              const text = `${circle.name}の新歓イベントをチェック！`;
              const url = typeof window !== "undefined" ? window.location.href : "";
              if (navigator.share) {
                navigator.share({ title: "中大新歓ナビ", text, url });
              } else {
                // フォールバック: LINEで共有
                window.open(`https://line.me/R/share?text=${encodeURIComponent(text + "\n" + url)}`);
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 mb-5 rounded-xl bg-gray-50 text-[13px] text-gray-500 font-medium active:bg-gray-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            友達にシェア
          </button>

          {/* 評価セクション */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-semibold text-gray-600">みんなの評価</p>
              <button onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-[12px] text-chuo font-semibold">
                {showReviewForm ? "閉じる" : "評価する"}
              </button>
            </div>

            {showReviewForm && (
              <div className="bg-gray-50 rounded-2xl p-4 mb-3">
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setNewRating(star)}
                      className={`text-2xl transition-colors ${star <= newRating ? "text-amber-400" : "text-gray-200"}`}>
                      ★
                    </button>
                  ))}
                  {newRating > 0 && <span className="text-[12px] text-gray-400 ml-2">{newRating}/5</span>}
                </div>
                <textarea placeholder="ひとことコメント（任意）" value={newComment}
                  onChange={(e) => setNewComment(e.target.value)} rows={2}
                  className="w-full px-3 py-2 bg-white rounded-xl text-[13px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-chuo/15 resize-none" />
                <button onClick={submitReview} disabled={newRating === 0}
                  className={`w-full mt-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${newRating > 0 ? "bg-chuo text-white active:opacity-80" : "bg-gray-200 text-gray-400"}`}>
                  送信
                </button>
              </div>
            )}

            {reviews.length > 0 ? (
              <div className="space-y-2">
                {reviews.slice(-5).reverse().map((rev, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] text-amber-400">{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</span>
                      <span className="text-[10px] text-gray-300 ml-auto">
                        {new Date(rev.timestamp).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    {rev.comment && <p className="text-[12px] text-gray-500 mt-1">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-gray-300 text-center py-3">まだ評価がありません</p>
            )}
          </div>
        </div>

        {/* ── 固定フッター: CTA ── */}
        <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          {/* LINE追加が最優先 */}
          {circle.lineAddUrl && (
            <a href={circle.lineAddUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 mb-2 rounded-2xl bg-[#06C755] text-white font-bold text-[14px] active:opacity-80 transition-opacity">
              <LineIcon />
              LINEで友だち追加
            </a>
          )}
          <div className="flex gap-2">
            <button onClick={onToggleKeep}
              className={`flex-1 py-3 rounded-2xl font-semibold text-[14px] transition-colors ${isKept ? "bg-keep-light text-keep border border-keep/20" : "bg-gray-50 text-gray-400"}`}>
              {isKept ? "★ キープ中" : "☆ キープ"}
            </button>
            {circle.applyUrl && (
              <a href={circle.applyUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 py-3 rounded-2xl font-bold text-[14px] text-center text-white bg-chuo active:opacity-80 transition-opacity">
                参加申し込み
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50/80 rounded-2xl p-3.5">
      <span className="text-base leading-none mt-0.5">{emoji}</span>
      <div className="min-w-0">
        <div className="text-[11px] text-gray-400 font-medium">{label}</div>
        <div className="text-[13px] text-gray-600 mt-0.5">{value}</div>
      </div>
    </div>
  );
}
