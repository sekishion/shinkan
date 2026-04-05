"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
  }, [router]);
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <p className="text-[13px] text-gray-400">リダイレクト中...</p>
    </div>
  );
}
