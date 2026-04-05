import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  const { email, password, action } = await request.json();

  if (!email || !password || !action) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  if (action === "signup") {
    // service_roleで作成するとメール確認が自動スキップされる
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // メール確認済みとして作成
    });

    if (error) {
      if (/already.*registered/i.test(error.message)) {
        return NextResponse.json({ error: "このメールアドレスは既に登録されています" }, { status: 400 });
      }
      if (/email.*invalid/i.test(error.message)) {
        return NextResponse.json({ error: "有効なメールアドレスを入力してください" }, { status: 400 });
      }
      return NextResponse.json({ error: "アカウント作成に失敗しました" }, { status: 400 });
    }

    return NextResponse.json({ user: { id: data.user.id, email: data.user.email } });
  }

  return NextResponse.json({ error: "不正なアクションです" }, { status: 400 });
}
