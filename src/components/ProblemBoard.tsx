"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Img = {
  id: string;
  data: string;
  caption: string;
  createdAt: string;
  uploadedBy: { name: string; role: string };
};

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProblemBoard({ lessonId }: { lessonId: string }) {
  const [images, setImages] = useState<Img[]>([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/lessons/${lessonId}/images`, { cache: "no-store" });
    if (res.ok) setImages((await res.json()).images);
  }, [lessonId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選んでください");
      return;
    }
    setUploading(true);
    try {
      const data = await readFileAsDataURL(file);
      const res = await fetch(`/api/lessons/${lessonId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "アップロードに失敗しました");
      } else {
        const { image } = await res.json();
        setImages((prev) => [...prev, image]);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remove(id: string) {
    if (!confirm("この画像を削除しますか？")) return;
    const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
    if (res.ok) setImages((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">先生・生徒どちらからでも問題画像を追加/削除できます。</p>
        <label className={`btn-primary cursor-pointer ${uploading ? "opacity-50" : ""}`}>
          {uploading ? "アップロード中..." : "＋ 画像を追加"}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
        </label>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {images.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
          まだ問題画像がありません。「画像を追加」から共有しましょう。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {images.map((img) => (
            <figure key={img.id} className="overflow-hidden rounded-xl ring-1 ring-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.data} alt={img.caption || "問題画像"} className="w-full bg-slate-50 object-contain" />
              <figcaption className="flex items-center justify-between bg-white px-3 py-2 text-xs text-slate-500">
                <span>{img.uploadedBy.name}（{img.uploadedBy.role === "TEACHER" ? "先生" : "生徒"}）</span>
                <button onClick={() => remove(img.id)} className="text-slate-400 hover:text-rose-600">削除</button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
