"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DbCircle {
  id: number;
  name: string;
  category: string;
  campus: string;
  description: string;
  events: { date: string; time: string; location: string; description: string }[];
  created_at: string;
}

export default function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [circles, setCircles] = useState<DbCircle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchMyCircles = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("circles")
      .select("id, name, category, campus, description, events, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setCircles(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/admin/login");
      return;
    }
    fetchMyCircles();
  }, [user, authLoading, router, fetchMyCircles]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    if (!user) return;
    setDeleting(id);
    const { error } = await supabase
      .from("circles")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) {
      alert("削除に失敗しました");
      setDeleting(null);
      return;
    }
    setCircles((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[13px] text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ヘッダー */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 pt-3 pb-2 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <Link href="/" className="text-[17px] font-bold text-chuo tracking-tight">白門ナビ</Link>
            <p className="text-[10px] text-gray-400 mt-0.5">サークル管理</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-[11px] text-gray-400 px-3 py-1.5 rounded-full bg-gray-50">
              トップ
            </Link>
            <button onClick={handleSignOut} className="text-[11px] text-gray-400 px-3 py-1.5 rounded-full bg-gray-50">
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 pb-12">
        {/* ユーザー情報 */}
        <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <p className="text-[11px] text-gray-400">ログイン中</p>
          <p className="text-[13px] text-gray-700 font-medium truncate">{user?.email}</p>
        </div>

        {/* 新規登録ボタン */}
        <Link
          href="/admin/new"
          className="flex items-center justify-center gap-2 w-full py-3.5 mb-6 rounded-2xl bg-chuo text-white font-bold text-[14px] active:opacity-80 transition-opacity"
        >
          + サークルを登録する
        </Link>

        {/* サークル一覧 */}
        <h3 className="text-[14px] font-bold text-gray-700 mb-3">登録したサークル</h3>

        {loading ? (
          <p className="text-[13px] text-gray-400 text-center py-8">読み込み中...</p>
        ) : circles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-[13px] text-gray-400">まだサークルを登録していません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {circles.map((c) => {
              const eventCount = (c.events || []).length;
              return (
                <div key={c.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[14px] font-bold text-gray-800 truncate">{c.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{c.category}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{c.campus}</span>
                        {eventCount > 0 && (
                          <span className="text-[10px] text-gray-400">イベント{eventCount}件</span>
                        )}
                      </div>
                      <p className="text-[12px] text-gray-400 mt-1.5 line-clamp-2">{c.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link
                      href={`/admin/edit/${c.id}`}
                      className="flex-1 py-2 rounded-xl text-[13px] font-semibold text-center bg-gray-50 text-gray-600 active:bg-gray-100"
                    >
                      編集
                    </Link>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      disabled={deleting === c.id}
                      className="flex-1 py-2 rounded-xl text-[13px] font-semibold text-center bg-red-50 text-red-500 active:bg-red-100"
                    >
                      {deleting === c.id ? "削除中..." : "削除"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
