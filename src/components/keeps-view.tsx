"use client";

import { useMemo } from "react";
import { circles } from "@/lib/data";
import { Circle } from "@/lib/types";
import { DAY_NAMES, toISO, countdownLabel } from "@/lib/utils";
import { LineIcon } from "./icons";

export function KeepsView({
  keeps,
  onToggleKeep,
  onSelectCircle,
}: {
  keeps: Set<string>;
  onToggleKeep: (id: string) => void;
  onSelectCircle: (c: Circle) => void;
}) {
  const today = toISO(new Date());

  const keptCircles = useMemo(() => {
    return circles
      .filter((c) => keeps.has(c.id))
      .map((c) => {
        const nextEvent = c.events.find((ev) => ev.date >= today);
        return { circle: c, nextEvent };
      })
      .sort((a, b) => {
        if (!a.nextEvent && !b.nextEvent) return 0;
        if (!a.nextEvent) return 1;
        if (!b.nextEvent) return -1;
        return a.nextEvent.date.localeCompare(b.nextEvent.date);
      });
  }, [keeps, today]);

  // 今日イベントがあるキープ数
  const todayCount = keptCircles.filter(
    ({ nextEvent }) => nextEvent && nextEvent.date === today
  ).length;

  // 空状態用: 人気サークル（イベントが多い or 部員数が多い順に3件）
  const popularCircles = useMemo(() => {
    if (keeps.size > 0) return [];
    return [...circles]
      .filter((c) => c.events.length > 0 || c.memberCount)
      .sort((a, b) => {
        const aScore = a.events.length * 10 + (parseInt(a.memberCount?.match(/\d+/)?.[0] || "0") || 0);
        const bScore = b.events.length * 10 + (parseInt(b.memberCount?.match(/\d+/)?.[0] || "0") || 0);
        return bScore - aScore;
      })
      .slice(0, 3);
  }, [keeps.size]);

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-bold text-gray-800">キープしたサークル</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {keeps.size > 0 ? `${keeps.size}件のサークルをキープ中` : "気になるサークルを★でキープしよう"}
            </p>
          </div>
        </div>
        {/* 今日のイベントサマリー */}
        {todayCount > 0 && (
          <div className="mt-2 bg-red-50 rounded-xl px-3 py-2 border border-red-100">
            <p className="text-[12px] font-bold text-red-500">
              今日のイベント: {todayCount}件
            </p>
          </div>
        )}
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {keptCircles.length === 0 ? (
          <div className="flex flex-col items-center text-gray-400 pt-10">
            <p className="text-4xl mb-3">★</p>
            <p className="text-[14px] font-medium">まだキープがありません</p>
            <p className="text-[12px] mt-1.5 text-gray-300 leading-relaxed text-center">
              「さがす」タブでサークルを見つけて<br />
              ★をタップしてキープしよう
            </p>

            {/* 人気サークルTOP3 */}
            {popularCircles.length > 0 && (
              <div className="w-full mt-6">
                <p className="text-[13px] font-semibold text-gray-600 mb-2 text-left">みんなが注目しているサークル</p>
                <div className="space-y-2">
                  {popularCircles.map((c) => {
                    const isSports = c.category === "運動系";
                    return (
                      <button key={c.id} onClick={() => onSelectCircle(c)}
                        className="w-full text-left bg-white rounded-2xl p-3.5 border border-gray-100 active:scale-[0.98] transition-transform">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${isSports ? "bg-sports" : "bg-culture"}`} />
                            <span className="text-[13px] font-bold text-gray-700 truncate">{c.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${isSports ? "bg-sports-light text-sports" : "bg-culture-light text-culture"}`}>
                              {c.category}
                            </span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); onToggleKeep(c.id); }}
                            className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full ${keeps.has(c.id) ? "bg-keep-light text-keep" : "bg-gray-50 text-gray-300"}`}>
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{c.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {keptCircles.map(({ circle, nextEvent }) => {
              const isSports = circle.category === "運動系";
              const cd = nextEvent ? countdownLabel(nextEvent.date) : null;
              return (
                <button
                  key={circle.id}
                  onClick={() => onSelectCircle(circle)}
                  className="w-full text-left bg-white rounded-2xl p-4 border border-gray-100 active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${isSports ? "bg-sports" : "bg-culture"}`} />
                      <span className="text-[14px] font-bold text-gray-800 truncate">{circle.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                        isSports ? "bg-sports-light text-sports" : "bg-culture-light text-culture"
                      }`}>
                        {circle.category}
                      </span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onToggleKeep(circle.id); }}
                      className="text-keep shrink-0 p-1">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  </div>

                  {nextEvent ? (
                    <div className={`rounded-xl px-3 py-2 mb-2 ${cd?.urgent ? "bg-red-50 border border-red-100" : "bg-chuo-light"}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] text-gray-400">次のイベント</div>
                        {cd?.text && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cd.urgent ? "bg-red-100 text-red-500" : "bg-chuo/10 text-chuo"}`}>
                            {cd.text}
                          </span>
                        )}
                      </div>
                      <div className={`text-[13px] font-semibold ${cd?.urgent ? "text-red-500" : "text-chuo"}`}>
                        {(() => {
                          const d = new Date(nextEvent.date);
                          return `${d.getMonth() + 1}/${d.getDate()}(${DAY_NAMES[d.getDay()]}) ${nextEvent.time}`;
                        })()}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {nextEvent.location} — {nextEvent.description}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-300 mb-2">予定されているイベントはありません</div>
                  )}

                  {/* クイックアクション: LINE追加 */}
                  {circle.lineAddUrl && (
                    <a href={circle.lineAddUrl} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[#06C755] text-white font-bold text-[12px] active:opacity-80 transition-opacity">
                      <LineIcon />
                      LINE追加
                    </a>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
