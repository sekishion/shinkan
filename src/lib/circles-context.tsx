"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Circle } from "./types";

const CirclesContext = createContext<{ circles: Circle[]; loading: boolean }>({
  circles: [],
  loading: true,
});

export function CirclesProvider({ children }: { children: ReactNode }) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/circles")
      .then((res) => res.json())
      .then((data) => {
        setCircles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load circles:", err);
        setLoading(false);
      });
  }, []);

  return (
    <CirclesContext.Provider value={{ circles, loading }}>
      {children}
    </CirclesContext.Provider>
  );
}

export function useCircles() {
  return useContext(CirclesContext);
}
