"use client";

import { useState, useCallback, useEffect } from "react";

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

export interface StoredReview {
  rating: number;
  comment: string;
  timestamp: number;
}

export function useReviews() {
  const [reviews, setReviews] = useState<Record<string, StoredReview[]>>({});

  useEffect(() => {
    const saved = localStorage.getItem("shinkan-reviews");
    if (saved) setReviews(JSON.parse(saved));
  }, []);

  const addReview = useCallback((circleId: string, rating: number, comment: string) => {
    setReviews((prev) => {
      const next = { ...prev };
      if (!next[circleId]) next[circleId] = [];
      next[circleId] = [...next[circleId], { rating, comment, timestamp: Date.now() }];
      localStorage.setItem("shinkan-reviews", JSON.stringify(next));
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
