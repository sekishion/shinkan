"use client";

import { useMemo } from "react";
import { circles } from "@/lib/data";
import { Circle } from "@/lib/types";
import { DAY_NAMES, toISO } from "@/lib/utils";

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
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {keptCircles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
            <p className="text-4xl mb-3">★</p>
            <p className="text-[14px] font-medium">まだキープがありません</p>
            <p className="text-[12px] mt-1.5 text-gray-300 leading-relaxed text-center">
              「さがす」タブでサークルを見つけて<br />
              ★をタップしてキープしよう
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {keptCircles.map(({ circle, nextEvent }) => {
              const isSports = circle.category === "運動系";
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

                  <p className="text-[12px] text-gray-500 line-clamp-1 mb-2">{circle.description}</p>

                  {nextEvent ? (
                    <div className="bg-chuo-light rounded-xl px-3 py-2">
                      <div className="text-[11px] text-gray-400 mb-0.5">次のイベント</div>
                      <div className="text-[13px] font-semibold text-chuo">
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
                    <div className="text-[11px] text-gray-300 mt-1">予定されているイベントはありません</div>
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
