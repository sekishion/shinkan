"use client";

import { useMemo, useState } from "react";
import { circles } from "@/lib/data";
import { Circle, Category } from "@/lib/types";
import { toISO, DAY_NAMES, ALL_TAGS, Tag, countdownLabel, detectActivity } from "@/lib/utils";

type Filter = "all" | Category;
const CAMPUSES = ["すべて", "多摩", "後楽園", "茗荷谷"] as const;

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
  const [selectedTags, setSelectedTags] = useState<Set<Tag>>(new Set());
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [eventFilter, setEventFilter] = useState<"" | "today" | "week">("");

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  // カテゴリ別件数（フィルタ前の全体から算出）
  const categoryCounts = useMemo(() => {
    const all = circles.length;
    const sports = circles.filter((c) => c.category === "運動系").length;
    const culture = circles.filter((c) => c.category === "文化系").length;
    return { all, sports, culture };
  }, []);

  const filtered = useMemo(() => {
    const today = toISO(new Date());
    const weekEnd = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return toISO(d);
    })();

    return circles.filter((c) => {
      if (filter !== "all" && c.category !== filter) return false;
      if (campus !== "すべて" && c.campus !== campus && c.campus !== "複数") return false;

      // 日付フィルタ
      if (eventFilter === "today") {
        if (!c.events.some((ev) => ev.date === today)) return false;
      } else if (eventFilter === "week") {
        if (!c.events.some((ev) => ev.date >= today && ev.date <= weekEnd)) return false;
      }

      // タグ絞り込み: 選択した全タグを持っているか（AND条件）
      if (selectedTags.size > 0) {
        for (const tag of selectedTags) {
          if (!c.tags.includes(tag)) return false;
        }
      }

      // テキスト検索: 名前・説明・タグにヒット
      if (search) {
        const q = search.toLowerCase();
        const inName = c.name.toLowerCase().includes(q);
        const inDesc = c.description.toLowerCase().includes(q);
        const inTags = c.tags.some((t) => t.toLowerCase().includes(q));
        if (!inName && !inDesc && !inTags) return false;
      }

      return true;
    }).sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [filter, campus, search, selectedTags, eventFilter]);

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-2">
        {/* 検索 */}
        <div className="relative mb-2">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="サークル名・タグで検索..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-[13px] border border-gray-100 focus:outline-none focus:ring-2 focus:ring-chuo/15 focus:border-chuo/30" />
        </div>

        {/* クイック検索 */}
        {!search && (
          <div className="flex gap-1.5 mb-2 overflow-x-auto no-scrollbar">
            {["テニス", "サッカー", "バンド", "ダンス", "バスケ", "ボランティア", "旅行", "写真"].map((kw) => (
              <button key={kw} onClick={() => setSearch(kw)}
                className="px-2.5 py-1 text-[11px] rounded-full bg-white border border-gray-150 text-gray-500 font-medium whitespace-nowrap shrink-0 active:bg-gray-50">
                {kw}
              </button>
            ))}
          </div>
        )}

        {/* カテゴリ + キャンパス */}
        <div className="flex gap-2 items-center mb-2">
          <div className="flex gap-0.5 flex-1 bg-gray-100/70 rounded-xl p-0.5">
            {([
              { label: "すべて", value: "all" as Filter, count: categoryCounts.all },
              { label: "運動系", value: "運動系" as Filter, count: categoryCounts.sports },
              { label: "文化系", value: "文化系" as Filter, count: categoryCounts.culture },
            ]).map((tab) => (
              <button key={tab.value} onClick={() => setFilter(tab.value)}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${filter === tab.value ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"}`}>
                {tab.label}<span className="text-[9px] ml-0.5 opacity-60">{tab.count}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-1 shrink-0">
            {CAMPUSES.map((c) => (
              <button key={c} onClick={() => setCampus(c)}
                className={`px-2 py-1.5 text-[10px] rounded-lg font-semibold transition-all ${campus === c ? "bg-chuo text-white" : "bg-gray-100 text-gray-400"}`}>
                {c === "すべて" ? "全" : c}
              </button>
            ))}
          </div>
        </div>

        {/* タグ絞り込み + 日付フィルタ */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* 日付フィルタ */}
          {(["today", "week"] as const).map((ef) => {
            const active = eventFilter === ef;
            const label = ef === "today" ? "今日イベント" : "今週イベント";
            return (
              <button key={ef} onClick={() => setEventFilter(active ? "" : ef)}
                className={`px-2.5 py-1.5 text-[11px] rounded-full font-semibold transition-all ${
                  active ? "bg-chuo text-white" : "bg-gray-50 text-gray-500 border border-gray-100"
                }`}>
                {label}
              </button>
            );
          })}

          <button onClick={() => setShowTagPicker(!showTagPicker)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] rounded-full font-semibold transition-all ${
              selectedTags.size > 0
                ? "bg-chuo text-white"
                : "bg-gray-50 text-gray-500 border border-gray-100"
            }`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            こだわり{selectedTags.size > 0 && ` (${selectedTags.size})`}
            <svg className={`w-3 h-3 transition-transform ${showTagPicker ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 選択中のタグをチップ表示 */}
          {Array.from(selectedTags).map((tag) => (
            <button key={tag} onClick={() => toggleTag(tag)}
              className="flex items-center gap-0.5 px-2 py-1 text-[10px] rounded-full bg-chuo/10 text-chuo font-semibold">
              {tag}
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
          {selectedTags.size > 0 && (
            <button onClick={() => setSelectedTags(new Set())}
              className="text-[10px] text-gray-400 underline">
              リセット
            </button>
          )}
        </div>

        {/* タグピッカー（展開時） */}
        {showTagPicker && (
          <div className="mt-2 bg-gray-50 rounded-2xl p-3 border border-gray-100">
            <div className="flex flex-wrap gap-1.5">
              {ALL_TAGS.map((tag) => {
                const active = selectedTags.has(tag);
                return (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1.5 text-[11px] rounded-full font-medium transition-all ${
                      active
                        ? "bg-chuo text-white shadow-sm"
                        : "bg-white text-gray-500 border border-gray-150"
                    }`}>
                    {active && <span className="mr-0.5">✓</span>}{tag}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowTagPicker(false)}
              className="w-full mt-2 py-1.5 text-[11px] text-gray-400 font-medium">
              閉じる
            </button>
          </div>
        )}
      </div>

      {/* 一覧 */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <p className="text-[11px] text-gray-400 mb-2">{filtered.length}件のサークル</p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-[13px] font-medium">見つかりませんでした</p>
            <p className="text-[11px] mt-1 text-gray-300">条件を変えて探してみてください</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((circle) => {
              const isSports = circle.category === "運動系";
              const isKept = keeps.has(circle.id);
              const activity = detectActivity(circle.name, circle.description);

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
                  <div className="flex items-start justify-between gap-2 mb-1">
                    {/* アクティビティアイコン */}
                    {activity && (
                      <div className="shrink-0 w-11 h-11 rounded-xl bg-gray-50 flex flex-col items-center justify-center">
                        <span className="text-[20px] leading-none">{activity.emoji}</span>
                        <span className="text-[8px] font-bold text-gray-500 mt-0.5 leading-none">{activity.label}</span>
                      </div>
                    )}
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

                  {/* 次のイベント（最重要情報を上部に配置） */}
                  {(() => {
                    const today = toISO(new Date());
                    const upcoming = circle.events.find((ev) => ev.date >= today);
                    if (!upcoming) return null;
                    const d = new Date(upcoming.date);
                    const cd = countdownLabel(upcoming.date);
                    return (
                      <div className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 mb-1.5 ${cd.urgent ? "bg-red-50 border border-red-100" : "bg-chuo-light border border-chuo/10"}`}>
                        <svg className={`w-3.5 h-3.5 shrink-0 ${cd.urgent ? "text-red-400" : "text-chuo"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className={`text-[12px] font-semibold truncate ${cd.urgent ? "text-red-500" : "text-chuo"}`}>
                          {d.getMonth() + 1}/{d.getDate()}({DAY_NAMES[d.getDay()]}) {upcoming.time} — {upcoming.description}
                        </span>
                        {cd.text && (
                          <span className={`text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded-full ml-auto ${cd.urgent ? "bg-red-100 text-red-500" : "bg-chuo/10 text-chuo"}`}>
                            {cd.text}
                          </span>
                        )}
                      </div>
                    );
                  })()}

                  <p className="text-[12px] text-gray-500 line-clamp-1 mb-1.5">{circle.description}</p>

                  <div className="flex items-center gap-3 text-[11px] text-gray-400 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate">{circle.activitySchedule}</span>
                    </div>
                    {circle.fee && (
                      <span className="shrink-0 text-gray-500 font-medium">{circle.fee}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
