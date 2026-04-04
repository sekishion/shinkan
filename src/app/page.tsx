"use client";

import { useState } from "react";
import { Circle } from "@/lib/types";
import { useKeeps, useReviews } from "@/lib/hooks";
import { CalendarView } from "@/components/calendar-view";
import { EventsView } from "@/components/events-view";
import { CirclesView } from "@/components/circles-view";
import { CircleDetail } from "@/components/circle-detail";

type Tab = "calendar" | "events" | "circles";

export default function Home() {
  const [tab, setTab] = useState<Tab>("calendar");
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [showKeepsOnly, setShowKeepsOnly] = useState(false);
  const { keeps, toggle } = useKeeps();
  const { addReview, getReviews, getAverage } = useReviews();

  return (
    <div className="h-screen flex flex-col bg-[#fafafa]">
      {/* ─── ヘッダー ─── */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 pt-3 pb-1.5 shrink-0">
        <h1 className="text-[17px] font-bold text-chuo tracking-tight">中大新歓ナビ</h1>
        <p className="text-[10px] text-gray-400 mt-0.5">2026年度 新歓イベントまとめ</p>
      </header>

      {/* ─── メインコンテンツ ─── */}
      <main className="flex-1 overflow-hidden max-w-lg w-full mx-auto">
        {tab === "calendar" && (
          <CalendarView keeps={keeps} onSelectCircle={setSelectedCircle} />
        )}
        {tab === "events" && (
          <EventsView
            keeps={keeps}
            onToggleKeep={toggle}
            onSelectCircle={setSelectedCircle}
            showKeepsOnly={showKeepsOnly}
            onToggleKeepsOnly={() => setShowKeepsOnly(!showKeepsOnly)}
          />
        )}
        {tab === "circles" && (
          <CirclesView keeps={keeps} onToggleKeep={toggle} onSelectCircle={setSelectedCircle} />
        )}
      </main>

      {/* ─── 下部タブバー ─── */}
      <nav className="bg-white/95 backdrop-blur-md border-t border-gray-100 shrink-0 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-lg mx-auto flex">
          <TabButton active={tab === "calendar"} onClick={() => setTab("calendar")} label="カレンダー"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>}
          />
          <TabButton active={tab === "events"} onClick={() => setTab("events")} label="新歓ナビ"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 14l2 2 4-4" /></svg>}
          />
          <TabButton active={tab === "circles"} onClick={() => setTab("circles")} label="サークル"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>}
          />
        </div>
      </nav>

      {/* ─── 詳細モーダル ─── */}
      {selectedCircle && (
        <CircleDetail
          circle={selectedCircle}
          isKept={keeps.has(selectedCircle.id)}
          onToggleKeep={() => toggle(selectedCircle.id)}
          onClose={() => setSelectedCircle(null)}
          reviews={getReviews(selectedCircle.id)}
          averageRating={getAverage(selectedCircle.id)}
          onAddReview={(rating, comment) => addReview(selectedCircle.id, rating, comment)}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-0.5 py-3 min-h-[56px] transition-colors ${
        active ? "text-chuo" : "text-gray-400"
      }`}
    >
      {icon}
      <span className="text-[10px] font-semibold mt-0.5">{label}</span>
    </button>
  );
}
