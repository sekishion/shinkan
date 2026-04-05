"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { CircleForm, type CircleFormData } from "@/components/circle-form";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCirclePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/admin/login");
  }, [user, loading, router]);

  const handleSubmit = async (data: CircleFormData): Promise<string | null> => {
    if (!user) return "ログインが必要です";

    const { error } = await supabase.from("circles").insert({
      ...data,
      user_id: user.id,
    });

    if (error) return "登録に失敗しました。もう一度お試しください。";
    setDone(true);
    return null;
  };

  if (loading || !user) {
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
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">登録完了!</h2>
          <p className="text-[14px] text-gray-500 mb-6">
            サークル情報が登録されました。<br />まもなく白門ナビに反映されます。
          </p>
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
            <p className="text-[10px] text-gray-400 mt-0.5">サークル新規登録</p>
          </div>
          <Link href="/admin" className="text-[12px] text-gray-400 px-3 py-1.5 rounded-full bg-gray-50">
            戻る
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 pb-12">
        <div className="bg-chuo-light rounded-2xl p-4 mb-6 border border-chuo/10">
          <p className="text-[13px] text-chuo/80 leading-relaxed">
            サークル・部活の情報を登録すると、白門ナビに掲載されます。新入生があなたの団体を見つけやすくなります!
          </p>
        </div>
        <CircleForm submitLabel="サークルを登録する" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
