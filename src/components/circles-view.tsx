"use client";

import { useMemo, useState } from "react";
import { circles } from "@/lib/data";
import { Circle, Category } from "@/lib/types";

type Filter = "all" | Category;
const CAMPUSES = ["すべて", "多摩", "後楽園"] as const;

export function CirclesView({
  keeps,
  onToggleKeep,
  onSelectCircle,
}: {
  keeps: Set<string>;
  onToggleKeep: (id: string) => void;
  onSelectCircle: (c: Circle) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [campus, setCampus] = useState<string>("すべて");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return circles.filter((c) => {
      if (filter !== "all" && c.category !== filter) return false;
      if (campus !== "すべて" && c.campus !== campus && c.campus !== "両方") return false;
      if (search) {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => {
      // PR（featured）を先頭に
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [filter, campus, search]);

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-2">
        {/* 検索 */}
        <div className="relative mb-2">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="サークル名で検索..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-[13px] border border-gray-100 focus:outline-none focus:ring-2 focus:ring-chuo/15 focus:border-chuo/30" />
        </div>

        {/* フィルタ */}
        <div className="flex gap-1 bg-gray-100/70 rounded-xl p-0.5 mb-2">
          {([
            { label: "すべて", value: "all" as Filter },
            { label: "運動系", value: "運動系" as Filter },
            { label: "文化系", value: "文化系" as Filter },
          ]).map((tab) => (
            <button key={tab.value} onClick={() => setFilter(tab.value)}
              className={`flex-1 py-1.5 text-[12px] font-semibold rounded-lg transition-all ${filter === tab.value ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* キャンパス */}
        <div className="flex gap-1.5">
          {CAMPUSES.map((c) => (
            <button key={c} onClick={() => setCampus(c)}
              className={`px-2.5 py-1 text-[11px] rounded-full font-medium transition-colors ${campus === c ? "bg-chuo text-white" : "bg-gray-100 text-gray-400"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 一覧 */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <p className="text-[11px] text-gray-400 mb-2">{filtered.length}件のサークル</p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-[13px] font-medium">見つかりませんでした</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((circle) => {
              const isSports = circle.category === "運動系";
              const isKept = keeps.has(circle.id);
              const nextEvent = circle.events[0];

              return (
                <button
                  key={circle.id}
                  onClick={() => onSelectCircle(circle)}
                  className={`w-full text-left rounded-2xl p-4 active:scale-[0.98] transition-transform ${
                    circle.featured
                      ? "bg-white border-2 border-chuo/15 shadow-sm shadow-chuo/5"
                      : "bg-white border border-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {circle.featured && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-chuo/10 text-chuo font-bold shrink-0">PR</span>}
                        <h3 className="text-[14px] font-bold text-gray-800 truncate">{circle.name}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isSports ? "bg-sports-light text-sports" : "bg-culture-light text-culture"}`}>
                          {circle.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-50 text-gray-500">{circle.campus}</span>
                        {circle.memberCount && <span className="text-[10px] text-gray-400">{circle.memberCount}</span>}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleKeep(circle.id); }}
                      className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isKept ? "bg-keep-light text-keep" : "bg-gray-50 text-gray-300"}`}
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-[12px] text-gray-500 line-clamp-1 mb-2">{circle.description}</p>

                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate">{circle.activitySchedule}</span>
                    </div>
                    {circle.fee && (
                      <span className="shrink-0 text-gray-500 font-medium">💰 {circle.fee}</span>
                    )}
                  </div>

                  {nextEvent && (
                    <div className="flex items-center gap-2 text-[11px] text-chuo font-medium mt-1">
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">次の新歓: {nextEvent.description}</span>
                    </div>
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
