"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { CircleForm, type CircleFormData } from "@/components/circle-form";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditCirclePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initial, setInitial] = useState<CircleFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/admin/login");
      return;
    }

    (async () => {
      const { data } = await supabase
        .from("circles")
        .select("*")
        .eq("id", Number(id))
        .eq("user_id", user.id)
        .single();

      if (!data) {
        router.push("/admin");
        return;
      }

      setInitial({
        name: data.name,
        type: data.type,
        category: data.category,
        campus: data.campus,
        description: data.description,
        activity_schedule: data.activity_schedule,
        fee: data.fee,
        member_count: data.member_count,
        gender_ratio: data.gender_ratio,
        multi_club_ok: data.multi_club_ok,
        notes: data.notes,
        tags: data.tags || [],
        line_add_url: data.line_add_url,
        apply_url: data.apply_url,
        x_url: data.x_url,
        instagram_url: data.instagram_url,
        events: data.events || [],
      });
      setLoading(false);
    })();
  }, [user, authLoading, id, router]);

  const handleSubmit = async (data: CircleFormData): Promise<string | null> => {
    const { error } = await supabase
      .from("circles")
      .update(data)
      .eq("id", Number(id));

    if (error) return "更新に失敗しました。もう一度お試しください。";
    setDone(true);
    return null;
  };

  if (authLoading || loading || !initial) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[13px] text-gray-400">読み込み中...</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">更新完了!</h2>
          <p className="text-[14px] text-gray-500 mb-6">サークル情報を更新しました。</p>
          <Link href="/admin" className="inline-block px-6 py-3 bg-chuo text-white font-bold rounded-2xl text-[14px]">
            管理画面に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 pt-3 pb-2 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-[17px] font-bold text-chuo tracking-tight">白門ナビ</h1>
            <p className="text-[10px] text-gray-400 mt-0.5">サークル情報の編集</p>
          </div>
          <Link href="/admin" className="text-[12px] text-gray-400 px-3 py-1.5 rounded-full bg-gray-50">
            戻る
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 pb-12">
        <CircleForm initial={initial} submitLabel="変更を保存する" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
