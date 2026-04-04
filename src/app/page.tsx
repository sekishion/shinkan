"use client";

import { useState, useCallback, useEffect } from "react";
import { Circle } from "@/lib/types";
import { useKeeps, useReviews } from "@/lib/hooks";
import { CalendarView } from "@/components/calendar-view";
import { CirclesView } from "@/components/circles-view";
import { KeepsView } from "@/components/keeps-view";
import { CircleDetail } from "@/components/circle-detail";

type Tab = "calendar" | "search" | "keeps";

export default function Home() {
  const [tab, setTab] = useState<Tab>("calendar");
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const { keeps, toggle } = useKeeps();
  const { addReview, getReviews, getAverage } = useReviews();
  const [toast, setToast] = useState<string | null>(null);

  const handleToggleKeep = useCallback((id: string) => {
    const wasKept = keeps.has(id);
    toggle(id);
    if (!wasKept) {
      setToast("キープしました ★");
      if (navigator.vibrate) navigator.vibrate(50);
    }
  }, [keeps, toggle]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="h-screen flex flex-col bg-[#fafafa]">
      {/* --- header --- */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 pt-3 pb-1.5 shrink-0">
        <h1 className="text-[17px] font-bold text-chuo tracking-tight">白門ナビ</h1>
        <p className="text-[10px] text-gray-400 mt-0.5">中央大学 新歓イベントまとめ 2026</p>
      </header>

      {/* --- main --- */}
      <main className="flex-1 overflow-hidden max-w-lg w-full mx-auto">
        {tab === "calendar" && (
          <CalendarView keeps={keeps} onSelectCircle={setSelectedCircle} />
        )}
        {tab === "search" && (
          <CirclesView keeps={keeps} onToggleKeep={handleToggleKeep} onSelectCircle={setSelectedCircle} />
        )}
        {tab === "keeps" && (
          <KeepsView keeps={keeps} onToggleKeep={handleToggleKeep} onSelectCircle={setSelectedCircle} />
        )}
      </main>

      {/* --- tab bar --- */}
      <nav className="bg-white/95 backdrop-blur-md border-t border-gray-100 shrink-0 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-lg mx-auto flex">
          <TabButton active={tab === "calendar"} onClick={() => setTab("calendar")} label="カレンダー"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>}
          />
          <TabButton active={tab === "search"} onClick={() => setTab("search")} label="さがす"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>}
          />
          <TabButton active={tab === "keeps"} onClick={() => setTab("keeps")} label="キープ"
            badge={keeps.size > 0 ? keeps.size : undefined}
            icon={<svg className="w-6 h-6" fill={tab === "keeps" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
          />
        </div>
      </nav>

      {/* --- detail modal --- */}
      {selectedCircle && (
        <CircleDetail
          circle={selectedCircle}
          isKept={keeps.has(selectedCircle.id)}
          onToggleKeep={() => handleToggleKeep(selectedCircle.id)}
          onClose={() => setSelectedCircle(null)}
          reviews={getReviews(selectedCircle.id)}
          averageRating={getAverage(selectedCircle.id)}
          onAddReview={(rating, comment) => addReview(selectedCircle.id, rating, comment)}
          onSelectCircle={setSelectedCircle}
        />
      )}
      {/* --- toast --- */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-bounce-in">
          <div className="bg-gray-800 text-white text-[13px] font-semibold px-5 py-2.5 rounded-full shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  icon,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-0.5 py-3 min-h-[56px] transition-colors relative ${
        active ? "text-chuo" : "text-gray-400"
      }`}
    >
      <div className="relative">
        {icon}
        {badge !== undefined && (
          <span className="absolute -top-1 -right-2.5 bg-chuo text-white text-[8px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-semibold mt-0.5">{label}</span>
    </button>
  );
}
