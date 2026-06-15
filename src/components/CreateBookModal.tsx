"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Upload } from "lucide-react";
import { useBookStore } from "@/stores/bookStore";
import type { StyleTemplate } from "@/types";
import { cn } from "@/lib/utils";

interface CreateBookModalProps {
  open: boolean;
  onClose: () => void;
}

const styleOptions: { value: StyleTemplate; label: string; desc: string; bg: string }[] = [
  { value: "light", label: "浅色款", desc: "清爽白底，干净的阅读体验", bg: "bg-white border-stone-300" },
  { value: "vintage", label: "做旧款", desc: "泛黄纸页，复古手写质感", bg: "bg-amber-100 border-amber-400" },
  { value: "starry", label: "星空款", desc: "深色星空背景，浪漫神秘", bg: "bg-indigo-950 border-indigo-600 text-white" },
  { value: "dark", label: "深色款", desc: "护眼暗色，适合夜间阅读", bg: "bg-stone-900 border-stone-600 text-white" },
];

/** 创建新书弹窗 */
export function CreateBookModal({ open, onClose }: CreateBookModalProps) {
  const router = useRouter();
  const createBook = useBookStore((s) => s.createBook);
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState<StyleTemplate>("light");
  const [coverImage, setCoverImage] = useState<string | undefined>();

  if (!open) return null;

  /** 处理封面上传 */
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCoverImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  /** 创建并跳转编辑页 */
  const handleCreate = () => {
    if (!title.trim()) return;
    const book = createBook(title.trim(), style);
    if (coverImage) {
      useBookStore.getState().updateBook(book.id, { coverImage });
    }
    onClose();
    router.push(`/book/${book.id}/edit`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-slide-up">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-lg font-bold text-stone-800">✨ 创建梦想之书</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* 书名输入 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              书名
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：我的环球旅行梦"
              className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>

          {/* 封面上传 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              封面图片（可选）
            </label>
            <label className="flex items-center justify-center gap-2 h-24 border-2 border-dashed border-stone-200 rounded-xl cursor-pointer hover:border-amber-300 hover:bg-amber-50/50 transition-colors">
              {coverImage ? (
                <img src={coverImage} alt="封面预览" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <div className="flex flex-col items-center text-stone-400">
                  <Upload className="size-6 mb-1" />
                  <span className="text-xs">点击上传封面</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          </div>

          {/* 风格选择 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              风格模板
            </label>
            <div className="grid grid-cols-2 gap-2">
              {styleOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStyle(opt.value)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left transition-all",
                    opt.bg,
                    style === opt.value
                      ? "ring-2 ring-amber-500 ring-offset-1 border-amber-500"
                      : "hover:border-amber-300"
                  )}
                >
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className={cn("text-xs mt-0.5", opt.value === "starry" || opt.value === "dark" ? "text-white/60" : "text-stone-500")}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-stone-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="px-5 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white rounded-xl transition-colors"
          >
            创建并开始编辑
          </button>
        </div>
      </div>
    </div>
  );
}
