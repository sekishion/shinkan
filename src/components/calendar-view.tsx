"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { circles } from "@/lib/data";
import { Circle, Category, Campus } from "@/lib/types";
import { DAY_NAMES, getWeekDates, toISO, isToday, parseTimeRange } from "@/lib/utils";

interface CalendarEvent {
  circle: Circle;
  eventIdx: number;
  startHour: number;
  endHour: number;
}

interface LayoutEvent extends CalendarEvent {
  col: number;
  totalCols: number;
}

const HOUR_START = 10;
const HOUR_END = 22;
const HOUR_HEIGHT = 64;

type Filter = "all" | Category;
type CampusFilter = "all" | "多摩" | "後楽園" | "茗荷谷";

// ─── 時間重複処理: 重なるイベントを横に並べる ───
function layoutEvents(events: CalendarEvent[]): LayoutEvent[] {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => a.startHour - b.startHour || a.endHour - b.endHour);
  const result: LayoutEvent[] = [];

  // グループ化: 重なりのあるイベントをまとめる
  const groups: CalendarEvent[][] = [];
  let currentGroup: CalendarEvent[] = [sorted[0]];
  let groupEnd = sorted[0].endHour;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startHour < groupEnd) {
      currentGroup.push(sorted[i]);
      groupEnd = Math.max(groupEnd, sorted[i].endHour);
    } else {
      groups.push(currentGroup);
      currentGroup = [sorted[i]];
      groupEnd = sorted[i].endHour;
    }
  }
  groups.push(currentGroup);

  for (const group of groups) {
    const totalCols = group.length;
    group.forEach((ev, col) => {
      result.push({ ...ev, col, totalCols });
    });
  }

  return result;
}

export function CalendarView({
  keeps,
  onSelectCircle,
}: {
  keeps: Set<string>;
  onSelectCircle: (c: Circle) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIdx, setSelectedDayIdx] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });
  const [filter, setFilter] = useState<Filter>("all");
  const [campusFilter, setCampusFilter] = useState<CampusFilter>("all");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!localStorage.getItem("shinkan-onboarded-cal")) setShowOnboarding(true);
  }, []);

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);
  const selectedDate = weekDates[selectedDayIdx];
  const selectedISO = toISO(selectedDate);

  const allEvents = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const date of weekDates) map[toISO(date)] = [];
    for (const circle of circles) {
      if (filter !== "all" && circle.category !== filter) continue;
      if (campusFilter !== "all" && circle.campus !== campusFilter && circle.campus !== "複数") continue;
      for (let ei = 0; ei < circle.events.length; ei++) {
        const ev = circle.events[ei];
        if (map[ev.date] !== undefined) {
          const { start, end } = parseTimeRange(ev.time);
          map[ev.date].push({ circle, eventIdx: ei, startHour: start, endHour: end });
        }
      }
    }
    return map;
  }, [weekDates, filter, campusFilter]);

  const todayEvents = allEvents[selectedISO] || [];
  const layouted = useMemo(() => layoutEvents(todayEvents), [todayEvents]);
  const totalHeight = (HOUR_END - HOUR_START) * HOUR_HEIGHT;

  // 最初のイベントまでスクロール
  useEffect(() => {
    if (scrollRef.current && todayEvents.length > 0) {
      const firstStart = Math.min(...todayEvents.map((e) => e.startHour));
      const scrollTo = Math.max((firstStart - HOUR_START - 0.5) * HOUR_HEIGHT, 0);
      scrollRef.current.scrollTop = scrollTo;
    }
  }, [selectedDayIdx, weekOffset, todayEvents]);

  const eventCounts = useMemo(() => {
    return weekDates.map((d) => (allEvents[toISO(d)] || []).length);
  }, [weekDates, allEvents]);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("shinkan-onboarded-cal", "1");
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── 初回案内 ── */}
      {showOnboarding && (
        <div className="bg-chuo-light border-b border-chuo/10 px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">📅</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-700">新歓イベントカレンダー</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                日付をタップして、その日のイベントをチェック。<br />
                気になるイベントをタップすると詳細が見れます。
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

      {/* ── ヘッダー ── */}
      <div className="bg-white border-b border-gray-100 px-4 pt-2 pb-1">
        {/* 週送り */}
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setWeekOffset(weekOffset - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-50">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <p className="text-[15px] font-bold text-gray-700">
              {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日({DAY_NAMES[selectedDate.getDay()]})
            </p>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="text-[11px] text-chuo font-semibold mt-0.5">今週に戻る</button>
            )}
          </div>
          <button onClick={() => setWeekOffset(weekOffset + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-50">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 日付セレクター */}
        <div className="flex gap-0.5 mb-2">
          {weekDates.map((date, i) => {
            const today = isToday(date);
            const selected = i === selectedDayIdx;
            const count = eventCounts[i];
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <button key={i} onClick={() => setSelectedDayIdx(i)}
                className={`flex-1 flex flex-col items-center py-2 rounded-2xl transition-all ${
                  selected ? "bg-chuo text-white shadow-sm" : today ? "bg-chuo-light text-chuo" : "text-gray-500 active:bg-gray-50"
                }`}>
                <span className={`text-[10px] font-semibold ${selected ? "text-white/80" : isWeekend ? "text-chuo/60" : "text-gray-400"}`}>
                  {DAY_NAMES[date.getDay()]}
                </span>
                <span className={`text-[16px] font-bold leading-tight mt-0.5 ${selected ? "text-white" : ""}`}>
                  {date.getDate()}
                </span>
                {count > 0 ? (
                  <span className={`text-[8px] font-bold mt-0.5 ${selected ? "text-white/70" : "text-chuo/50"}`}>
                    {count}件
                  </span>
                ) : (
                  <span className="text-[8px] mt-0.5 text-transparent">0</span>
                )}
              </button>
            );
          })}
        </div>

        {/* フィルタ行: カテゴリ + キャンパス */}
        <div className="flex gap-2 items-center">
          {/* カテゴリ */}
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

          {/* キャンパス */}
          <div className="flex gap-1 shrink-0">
            {(["all", "多摩", "後楽園", "茗荷谷"] as CampusFilter[]).map((c) => (
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

      {/* ── タイムテーブル ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white">
        {todayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-[14px] font-medium">この日のイベントはありません</p>
            <p className="text-[12px] mt-1 text-gray-300">他の日をタップしてみてください</p>
          </div>
        ) : (
          <div className="relative" style={{ height: totalHeight }}>
            {/* 時間グリッド */}
            {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
              <div key={i} className="absolute w-full flex items-start" style={{ top: i * HOUR_HEIGHT }}>
                <div className="w-12 shrink-0 text-right pr-2 -mt-2">
                  <span className="text-[11px] text-gray-300 font-medium">{HOUR_START + i}:00</span>
                </div>
                <div className="flex-1 border-t border-gray-100/80" />
              </div>
            ))}

            {/* イベントブロック */}
            <div className="absolute top-0 bottom-0 left-12 right-3">
              {layouted.map(({ circle, eventIdx, startHour, endHour, col, totalCols }) => {
                const top = (Math.max(startHour, HOUR_START) - HOUR_START) * HOUR_HEIGHT + 2;
                const duration = Math.min(endHour, HOUR_END) - Math.max(startHour, HOUR_START);
                const height = Math.max(duration * HOUR_HEIGHT - 4, 48);
                const isSports = circle.category === "運動系";
                const featured = circle.featured;
                const ev = circle.events[eventIdx];
                const isKept = keeps.has(circle.id);

                // 横並び: col/totalCols で左右位置を計算
                const widthPercent = 100 / totalCols;
                const leftPercent = col * widthPercent;
                const gap = totalCols > 1 ? 2 : 0;

                return (
                  <button
                    key={`${circle.id}-${eventIdx}`}
                    onClick={() => onSelectCircle(circle)}
                    className={`absolute rounded-2xl px-3 py-2 text-left transition-all active:scale-[0.98] overflow-hidden ${
                      featured
                        ? "bg-white border-2 border-chuo/20 shadow-md shadow-chuo/5 z-10"
                        : isSports
                          ? "bg-sports-light border border-sports/20"
                          : "bg-culture-light border border-culture/20"
                    }`}
                    style={{
                      top,
                      height,
                      left: `calc(${leftPercent}% + ${gap}px)`,
                      width: `calc(${widthPercent}% - ${gap * 2}px)`,
                    }}
                  >
                    {/* PR バッジ */}
                    {featured && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-chuo/10 text-chuo font-bold">PR</span>
                    )}

                    {/* サークル名 */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${isSports ? "bg-sports" : "bg-culture"}`} />
                      <span className={`text-[13px] font-bold truncate ${featured ? "text-gray-800" : "text-gray-700"}`}>
                        {circle.name}
                      </span>
                      {isKept && <span className="text-amber-400 text-[11px] ml-auto shrink-0">★</span>}
                    </div>

                    {/* 詳細（ブロック高さに応じて出す） */}
                    {height > 56 && (
                      <div className="mt-1 text-[11px] text-gray-400 truncate">
                        {ev.time}
                      </div>
                    )}
                    {height > 76 && (
                      <div className="text-[11px] text-gray-400 truncate">
                        📍 {ev.location}
                      </div>
                    )}
                    {height > 96 && (
                      <div className="text-[11px] text-gray-500 truncate mt-0.5">
                        {ev.description}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 現在時刻ライン */}
            <CurrentTimeLine />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 現在時刻の赤い線 ───
function CurrentTimeLine() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour < HOUR_START || hour > HOUR_END) return null;

  const top = (hour - HOUR_START) * HOUR_HEIGHT;

  return (
    <div className="absolute left-12 right-0 flex items-center z-20 pointer-events-none" style={{ top }}>
      <div className="w-2 h-2 rounded-full bg-chuo -ml-1" />
      <div className="flex-1 h-[1.5px] bg-chuo/60" />
    </div>
  );
}
