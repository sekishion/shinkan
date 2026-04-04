"use client";

import { useMemo, useState, useEffect } from "react";
import { circles } from "@/lib/data";
import { Circle, Category } from "@/lib/types";
import { DAY_NAMES, getWeekDates, toISO, isToday } from "@/lib/utils";

type Filter = "all" | Category;
type CampusFilter = "all" | "多摩" | "後楽園";

export function EventsView({
  keeps,
  onToggleKeep,
  onSelectCircle,
  showKeepsOnly,
  onToggleKeepsOnly,
}: {
  keeps: Set<string>;
  onToggleKeep: (id: string) => void;
  onSelectCircle: (c: Circle) => void;
  showKeepsOnly: boolean;
  onToggleKeepsOnly: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [campusFilter, setCampusFilter] = useState<CampusFilter>("all");
  const [weekOffset, setWeekOffset] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("shinkan-onboarded-ev")) setShowOnboarding(true);
  }, []);

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);

  // キープ中サークルの次のイベント一覧
  const keptCirclesWithNext = useMemo(() => {
    if (!showKeepsOnly) return [];
    const today = toISO(new Date());
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
  }, [keeps, showKeepsOnly]);

  const dayEvents = useMemo(() => {
    const map: Record<string, { circle: Circle; eventIdx: number }[]> = {};
    for (const date of weekDates) map[toISO(date)] = [];
    for (const circle of circles) {
      if (filter !== "all" && circle.category !== filter) continue;
      if (campusFilter !== "all" && circle.campus !== campusFilter && circle.campus !== "両方") continue;
      if (showKeepsOnly && !keeps.has(circle.id)) continue;
      for (let ei = 0; ei < circle.events.length; ei++) {
        const ev = circle.events[ei];
        if (map[ev.date] !== undefined) map[ev.date].push({ circle, eventIdx: ei });
      }
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => {
        if (a.circle.featured && !b.circle.featured) return -1;
        if (!a.circle.featured && b.circle.featured) return 1;
        return 0;
      });
    }
    return map;
  }, [weekDates, filter, campusFilter, showKeepsOnly, keeps]);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("shinkan-onboarded-ev", "1");
  };

  return (
    <div className="flex flex-col h-full">
      {/* 初回案内 */}
      {showOnboarding && (
        <div className="bg-chuo-light border-b border-chuo/10 px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">🔍</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-700">新歓ナビ</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                1週間のイベントを日ごとにチェック。<br />
                ★でキープすると、あとからまとめて見れます。
              </p>
            </div>
            <button onClick={dismissOnboarding} className="text-gray-400 shrink-0 p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset(weekOffset - 1)} className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 active:bg-gray-50">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-[14px] font-bold text-gray-700">
              {weekDates[0].getMonth() + 1}/{weekDates[0].getDate()} 〜 {weekDates[6].getMonth() + 1}/{weekDates[6].getDate()}
            </span>
            <button onClick={() => setWeekOffset(weekOffset + 1)} className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 active:bg-gray-50">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="text-[10px] text-chuo font-semibold">今週</button>
            )}
          </div>
          <button onClick={onToggleKeepsOnly}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              showKeepsOnly ? "bg-keep-light text-keep border border-keep/20" : "bg-gray-50 text-gray-400"
            }`}>
            ★ キープ{keeps.size > 0 ? ` ${keeps.size}` : ""}
          </button>
        </div>

        {/* フィルタ行 */}
        <div className="flex gap-2 items-center">
          <div className="flex gap-0.5 flex-1 bg-gray-100/70 rounded-xl p-0.5">
            {([
              { label: "全て", value: "all" as Filter },
              { label: "運動系", value: "運動系" as Filter },
              { label: "文化系", value: "文化系" as Filter },
            ]).map((tab) => (
              <button key={tab.value} onClick={() => setFilter(tab.value)}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                  filter === tab.value ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 shrink-0">
            {(["all", "多摩", "後楽園"] as CampusFilter[]).map((c) => (
              <button key={c} onClick={() => setCampusFilter(c)}
                className={`px-2 py-1.5 text-[10px] rounded-lg font-semibold transition-all ${
                  campusFilter === c ? "bg-chuo text-white" : "bg-gray-100 text-gray-400"
                }`}>
                {c === "all" ? "全" : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto px-4 py-3">

        {/* キープモード: サークルカード一覧（次のイベント付き） */}
        {showKeepsOnly ? (
          keptCirclesWithNext.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-3xl mb-2">★</p>
              <p className="text-[13px] font-medium">まだキープがありません</p>
              <p className="text-[11px] mt-1 text-gray-300">気になるサークルの★をタップしてキープ</p>
            </div>
          ) : (
            <div className="space-y-2">
              {keptCirclesWithNext.map(({ circle, nextEvent }) => {
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
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); onToggleKeep(circle.id); }}
                        className="text-keep shrink-0 p-1">
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    </div>

                    {nextEvent ? (
                      <div className="bg-chuo-light rounded-xl px-3 py-2 mt-2">
                        <div className="text-[11px] text-gray-400 mb-0.5">次のイベント</div>
                        <div className="text-[13px] font-semibold text-chuo">
                          {(() => {
                            const d = new Date(nextEvent.date);
                            return `${d.getMonth() + 1}/${d.getDate()}(${DAY_NAMES[d.getDay()]}) ${nextEvent.time}`;
                          })()}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          📍 {nextEvent.location} — {nextEvent.description}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-300 mt-1">予定されているイベントはありません</div>
                    )}
                  </button>
                );
              })}
            </div>
          )
        ) : (
          /* 通常モード: 日ごとのイベントリスト */
          <>
            <div className="space-y-1">
              {weekDates.map((date) => {
                const iso = toISO(date);
                const events = dayEvents[iso] || [];
                const today = isToday(date);
                const dayName = DAY_NAMES[date.getDay()];
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                return (
                  <div key={iso} className="flex gap-3 py-2">
                    <div className="w-11 shrink-0 text-center pt-0.5">
                      <div className={`text-[10px] font-semibold ${today ? "text-chuo" : isWeekend ? "text-chuo/50" : "text-gray-400"}`}>
                        {dayName}
                      </div>
                      <div className={`text-[18px] font-bold leading-tight mt-0.5 ${
                        today ? "text-white bg-chuo rounded-xl w-9 h-9 flex items-center justify-center mx-auto" : isWeekend ? "text-chuo/40" : "text-gray-700"
                      }`}>
                        {date.getDate()}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {events.length === 0 ? (
                        <div className="py-3 text-[11px] text-gray-300 border-b border-gray-100/60">イベントなし</div>
                      ) : (
                        <div className="space-y-1.5 pb-2 border-b border-gray-100/60">
                          {events.map(({ circle, eventIdx }) => {
                            const ev = circle.events[eventIdx];
                            const isSports = circle.category === "運動系";
                            const featured = circle.featured;
                            const isKept = keeps.has(circle.id);

                            return (
                              <button
                                key={`${circle.id}-${eventIdx}`}
                                onClick={() => onSelectCircle(circle)}
                                className={`w-full text-left rounded-xl transition-all active:scale-[0.97] border ${
                                  featured
                                    ? "px-3 py-2.5 bg-white border-chuo/20 shadow-sm shadow-chuo/5 ring-1 ring-chuo/10"
                                    : `px-3 py-2 ${isSports ? "bg-sports-light border-sports-dot/30" : "bg-culture-light border-culture-dot/30"}`
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {featured && <span className="text-[9px] px-1.5 py-0.5 rounded bg-chuo/10 text-chuo font-bold shrink-0">PR</span>}
                                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSports ? "bg-sports" : "bg-culture"}`} />
                                  <span className={`text-[13px] font-semibold truncate ${featured ? "text-gray-800" : "text-gray-700"}`}>{circle.name}</span>
                                  {isKept && <span className="text-amber-400 text-xs ml-auto shrink-0">★</span>}
                                </div>
                                <div className="mt-0.5 ml-3.5 flex items-center gap-2 text-[11px] text-gray-400">
                                  <span>{ev.time}</span>
                                  <span className="text-gray-300">|</span>
                                  <span className="truncate">📍{ev.location}</span>
                                  <span className="text-gray-300">|</span>
                                  <span className="truncate">{ev.description}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-4 mt-4 mb-2 text-[10px] text-gray-400">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sports" />運動部</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-culture" />文化部</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
