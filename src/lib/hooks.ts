"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "./supabase";

// ─── キープ（localStorage） ───

export function useKeeps() {
  const [keeps, setKeeps] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem("shinkan-keeps");
    if (saved) setKeeps(new Set(JSON.parse(saved)));
  }, []);

  const toggle = useCallback((id: string) => {
    setKeeps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("shinkan-keeps", JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { keeps, toggle };
}

// ─── 評価（Supabase） ───

export interface StoredReview {
  rating: number;
  comment: string;
  timestamp: number;
}

export function useReviews() {
  const [reviews, setReviews] = useState<Record<string, StoredReview[]>>({});

  // 初回: Supabaseから全レビューを取得
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("circle_id, rating, comment, created_at")
        .order("created_at", { ascending: true });

      if (error || !data) return;

      const map: Record<string, StoredReview[]> = {};
      for (const row of data) {
        if (!map[row.circle_id]) map[row.circle_id] = [];
        map[row.circle_id].push({
          rating: row.rating,
          comment: row.comment || "",
          timestamp: new Date(row.created_at).getTime(),
        });
      }
      setReviews(map);
    })();
  }, []);

  const addReview = useCallback(async (circleId: string, rating: number, comment: string) => {
    // Supabaseに保存
    const { error } = await supabase
      .from("reviews")
      .insert({ circle_id: circleId, rating, comment });

    if (error) {
      console.error("Failed to save review:", error);
      return;
    }

    // ローカルステートに追加
    setReviews((prev) => {
      const next = { ...prev };
      if (!next[circleId]) next[circleId] = [];
      next[circleId] = [...next[circleId], { rating, comment, timestamp: Date.now() }];
      return next;
    });
  }, []);

  const getReviews = useCallback((circleId: string) => {
    return reviews[circleId] || [];
  }, [reviews]);

  const getAverage = useCallback((circleId: string) => {
    const r = reviews[circleId];
    if (!r || r.length === 0) return null;
    return r.reduce((sum, rev) => sum + rev.rating, 0) / r.length;
  }, [reviews]);

  return { reviews, addReview, getReviews, getAverage };
}
