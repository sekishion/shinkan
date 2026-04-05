"use client";

import { useState } from "react";

const CAMPUSES = ["多摩", "後楽園", "茗荷谷"] as const;

const CATEGORIES = [
  { label: "運動系", value: "運動系" },
  { label: "文化系", value: "文化系" },
] as const;

const TYPES = [
  { label: "サークル", value: "サークル" },
  { label: "部活", value: "部活" },
  { label: "その他", value: "その他" },
] as const;

const ATMOSPHERE_TAGS = ["初心者歓迎", "ガチ・経験者向け", "ゆるめ", "イベント多め"];

export interface EventForm {
  date: string;
  time: string;
  location: string;
  description: string;
}

export interface CircleFormData {
  name: string;
  type: string;
  category: string;
  campus: string;
  description: string;
  activity_schedule: string;
  fee: string | null;
  member_count: string | null;
  gender_ratio: string | null;
  multi_club_ok: boolean;
  notes: string | null;
  tags: string[];
  line_add_url: string | null;
  apply_url: string | null;
  x_url: string | null;
  instagram_url: string | null;
  events: EventForm[];
}

export interface CircleFormProps {
  initial?: Partial<CircleFormData>;
  submitLabel: string;
  onSubmit: (data: CircleFormData) => Promise<string | null>; // returns error or null
}

const emptyEvent = (): EventForm => ({ date: "", time: "", location: "", description: "" });

/** campus値 → 選択されたキャンパス配列 */
function campusToArray(campus?: string): string[] {
  if (!campus) return [];
  if (campus === "複数") return ["多摩", "後楽園", "茗荷谷"];
  return [campus];
}

export function CircleForm({ initial, submitLabel, onSubmit }: CircleFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState(initial?.type || "サークル");
  const [category, setCategory] = useState(initial?.category || "運動系");
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>(campusToArray(initial?.campus));
  const [description, setDescription] = useState(initial?.description || "");
  const [activitySchedule, setActivitySchedule] = useState(initial?.activity_schedule || "");

  const [fee, setFee] = useState(initial?.fee || "");
  const [memberCount, setMemberCount] = useState(initial?.member_count || "");
  const [genderRatio, setGenderRatio] = useState(initial?.gender_ratio || "");
  const [multiClubOk, setMultiClubOk] = useState(initial?.multi_club_ok || false);
  const [notes, setNotes] = useState(initial?.notes || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(initial?.tags || []);

  const [lineAddUrl, setLineAddUrl] = useState(initial?.line_add_url || "");
  const [applyUrl, setApplyUrl] = useState(initial?.apply_url || "");
  const [xUrl, setXUrl] = useState(initial?.x_url || "");
  const [instagramUrl, setInstagramUrl] = useState(initial?.instagram_url || "");

  const [events, setEvents] = useState<EventForm[]>(
    initial?.events?.length ? initial.events : [emptyEvent()],
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleCampus = (c: string) => {
    setSelectedCampuses((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const updateEvent = (index: number, field: keyof EventForm, value: string) => {
    setEvents((prev) => prev.map((ev, i) => (i === index ? { ...ev, [field]: value } : ev)));
  };

  const addEvent = () => {
    if (events.length < 5) setEvents((prev) => [...prev, emptyEvent()]);
  };

  const removeEvent = (index: number) => {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !activitySchedule.trim() || selectedCampuses.length === 0) {
      setError("団体名・紹介文・活動日時・キャンパスは必須です");
      return;
    }
    setError("");
    setSubmitting(true);

    const data: CircleFormData = {
      name: name.trim(),
      type,
      category,
      campus: selectedCampuses.length > 1 ? "複数" : selectedCampuses[0],
      description: description.trim(),
      activity_schedule: activitySchedule.trim(),
      fee: fee.trim() || null,
      member_count: memberCount.trim() || null,
      gender_ratio: genderRatio.trim() || null,
      multi_club_ok: multiClubOk,
      notes: notes.trim() || null,
      tags: selectedTags,
      line_add_url: lineAddUrl.trim() || null,
      apply_url: applyUrl.trim() || null,
      x_url: xUrl.trim() || null,
      instagram_url: instagramUrl.trim() || null,
      events: events.filter((ev) => ev.date && ev.description),
    };

    const err = await onSubmit(data);
    setSubmitting(false);
    if (err) setError(err);
  };

  return (
    <div className="space-y-0">
      {/* ── 基本情報 ── */}
      <Section title="基本情報" required>
        <Input label="団体名" value={name} onChange={setName} placeholder="例: テニスサークル○○" required />

        <div className="grid grid-cols-2 gap-2">
          <SelectField label="団体区分" value={type} onChange={setType} options={TYPES} />
          <SelectField label="カテゴリ" value={category} onChange={setCategory} options={CATEGORIES} />
        </div>

        <div>
          <label className="text-[11px] text-gray-400 font-medium mb-1.5 block">
            キャンパス<span className="text-red-400 ml-0.5">*</span>
            <span className="text-gray-300 ml-1">複数選択可</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CAMPUSES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCampus(c)}
                className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                  selectedCampuses.includes(c) ? "bg-chuo text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <TextArea label="団体紹介文" value={description} onChange={setDescription} placeholder="どんな活動をしていますか？雰囲気は？" required />
        <Input label="通常の活動日時" value={activitySchedule} onChange={setActivitySchedule} placeholder="例: 毎週火・木 18:00〜21:00" required />
      </Section>

      {/* ── 詳細情報 ── */}
      <Section title="詳細情報（任意）">
        <div className="grid grid-cols-3 gap-2">
          <Input label="会費" value={fee} onChange={setFee} placeholder="例: 月2000円" />
          <Input label="部員数" value={memberCount} onChange={setMemberCount} placeholder="例: 40人" />
          <Input label="男女比" value={genderRatio} onChange={setGenderRatio} placeholder="例: 6:4" />
        </div>

        <div className="flex items-center gap-3 py-1">
          <button
            type="button"
            onClick={() => setMultiClubOk(!multiClubOk)}
            className={`w-10 h-6 rounded-full transition-colors relative ${multiClubOk ? "bg-chuo" : "bg-gray-200"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${multiClubOk ? "translate-x-5" : "translate-x-1"}`} />
          </button>
          <span className="text-[13px] text-gray-600">兼サーOK</span>
        </div>

        <Input label="新入生へのひとこと" value={notes} onChange={setNotes} placeholder="例: 初心者大歓迎です!" />

        <div>
          <label className="text-[11px] text-gray-400 font-medium mb-1.5 block">雰囲気タグ</label>
          <div className="flex flex-wrap gap-2">
            {ATMOSPHERE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                  selectedTags.includes(tag) ? "bg-chuo text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── SNS・リンク ── */}
      <Section title="SNS・リンク（任意）">
        <Input label="LINE追加URL" value={lineAddUrl} onChange={setLineAddUrl} placeholder="https://line.me/..." />
        <Input label="入部申込URL" value={applyUrl} onChange={setApplyUrl} placeholder="Google Forms等のURL" />
        <Input label="X (Twitter)" value={xUrl} onChange={setXUrl} placeholder="https://x.com/..." />
        <Input label="Instagram" value={instagramUrl} onChange={setInstagramUrl} placeholder="https://instagram.com/..." />
      </Section>

      {/* ── 新歓イベント ── */}
      <Section title="新歓イベント（任意）">
        {events.map((ev, i) => (
          <div key={i} className="bg-gray-50 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-semibold text-gray-500">イベント {i + 1}</span>
              {events.length > 1 && (
                <button type="button" onClick={() => removeEvent(i)} className="text-[11px] text-red-400 font-medium">
                  削除
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={ev.date} onChange={(e) => updateEvent(i, "date", e.target.value)}
                className="px-3 py-2 bg-white rounded-xl text-[13px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-chuo/20" />
              <input type="time" value={ev.time} onChange={(e) => updateEvent(i, "time", e.target.value)}
                className="px-3 py-2 bg-white rounded-xl text-[13px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-chuo/20" />
            </div>
            <input placeholder="場所（例: 多摩キャンパス 体育館）" value={ev.location} onChange={(e) => updateEvent(i, "location", e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl text-[13px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-chuo/20" />
            <input placeholder="内容（例: 体験会＆交流会）" value={ev.description} onChange={(e) => updateEvent(i, "description", e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl text-[13px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-chuo/20" />
          </div>
        ))}
        {events.length < 5 && (
          <button type="button" onClick={addEvent}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-[13px] text-gray-400 font-medium">
            + イベントを追加
          </button>
        )}
      </Section>

      {error && (
        <div className="bg-red-50 text-red-600 text-[13px] px-4 py-3 rounded-xl mb-4">{error}</div>
      )}

      <button onClick={handleSubmit} disabled={submitting}
        className={`w-full py-3.5 rounded-2xl font-bold text-[15px] transition-all ${
          submitting ? "bg-gray-200 text-gray-400" : "bg-chuo text-white active:opacity-80"
        }`}>
        {submitting ? "保存中..." : submitLabel}
      </button>
    </div>
  );
}

// ── 共通UI ──

function Section({ title, required, children }: { title: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-[14px] font-bold text-gray-700 mb-3 flex items-center gap-1.5">
        {title}
        {required && <span className="text-[10px] text-red-400 font-semibold">必須</span>}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] text-gray-400 font-medium mb-1 block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-white rounded-xl text-[13px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-chuo/20" />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] text-gray-400 font-medium mb-1 block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
        className="w-full px-3 py-2.5 bg-white rounded-xl text-[13px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-chuo/20 resize-none" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: readonly { label: string; value: string }[];
}) {
  return (
    <div>
      <label className="text-[11px] text-gray-400 font-medium mb-1 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-2.5 bg-white rounded-xl text-[13px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-chuo/20 appearance-none">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
