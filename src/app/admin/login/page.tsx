"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signUpDone, setSignUpDone] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }
    if (isSignUp && password.length < 6) {
      setError("パスワードは6文字以上にしてください");
      return;
    }

    setError("");
    setLoading(true);

    if (isSignUp) {
      const err = await signUp(email, password);
      setLoading(false);
      if (err) {
        setError(err.message);
        return;
      }
      setSignUpDone(true);
    } else {
      const err = await signIn(email, password);
      setLoading(false);
      if (err) {
        setError("メールアドレスまたはパスワードが正しくありません");
        return;
      }
      router.push("/admin");
    }
  };

  if (signUpDone) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">確認メールを送信しました</h2>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-700">{email}</span> に確認メールを送りました。
            メール内のリンクをクリックしてから、ログインしてください。
          </p>
          <button
            onClick={() => { setIsSignUp(false); setSignUpDone(false); }}
            className="mt-6 px-6 py-2.5 bg-chuo text-white font-bold rounded-2xl text-[14px]"
          >
            ログイン画面へ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-sm">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <Link href="/" className="text-[17px] font-bold text-chuo">白門ナビ</Link>
          <p className="text-[12px] text-gray-400 mt-1">サークル管理</p>
        </div>

        <h2 className="text-[16px] font-bold text-gray-800 mb-5 text-center">
          {isSignUp ? "アカウント作成" : "ログイン"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-gray-400 font-medium mb-1 block">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@chuo-u.ac.jp"
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-[13px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-chuo/20"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-400 font-medium mb-1 block">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignUp ? "6文字以上" : "パスワード"}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-[13px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-chuo/20"
            />
          </div>
        </div>

        {error && (
          <p className="text-[12px] text-red-500 mt-3">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full mt-5 py-3 rounded-2xl font-bold text-[14px] transition-all ${
            loading ? "bg-gray-200 text-gray-400" : "bg-chuo text-white active:opacity-80"
          }`}
        >
          {loading ? "処理中..." : isSignUp ? "アカウント作成" : "ログイン"}
        </button>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
          className="w-full mt-3 text-[12px] text-gray-400 text-center"
        >
          {isSignUp ? "すでにアカウントをお持ちの方" : "はじめての方はこちら（アカウント作成）"}
        </button>
      </div>
    </div>
  );
}
