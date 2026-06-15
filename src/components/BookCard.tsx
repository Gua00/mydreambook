"use client";

import Link from "next/link";
import { BookOpen, Edit3, Trash2, Eye } from "lucide-react";
import type { DreamBook } from "@/types";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: DreamBook;
  pageCount: number;
  onDelete: (id: string) => void;
}

/** 风格封面映射 */
const styleCovers: Record<string, { bg: string; accent: string; label: string }> = {
  vintage: {
    bg: "bg-amber-100 border-amber-300",
    accent: "text-amber-700",
    label: "做旧款",
  },
  starry: {
    bg: "bg-indigo-950 border-indigo-700",
    accent: "text-yellow-400",
    label: "星空款",
  },
  light: {
    bg: "bg-white border-stone-200",
    accent: "text-amber-600",
    label: "浅色款",
  },
  dark: {
    bg: "bg-stone-900 border-stone-700",
    accent: "text-amber-400",
    label: "深色款",
  },
};

/** 单本书卡片 */
export function BookCard({ book, pageCount, onDelete }: BookCardProps) {
  const cover = styleCovers[book.style] || styleCovers.light;

  return (
    <div className="group relative animate-card-entrance">
      {/* 删除按钮 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          if (confirm(`确定删除「${book.title}」吗？此操作不可恢复。`)) {
            onDelete(book.id);
          }
        }}
        className="absolute -top-2 -right-2 z-10 p-1.5 rounded-full bg-white border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
        title="删除"
      >
        <Trash2 className="size-3.5" />
      </button>

      <Link
        href={`/book/${book.id}/read`}
        className="block rounded-xl overflow-hidden book-shadow transition-all hover:scale-[1.02] hover:-translate-y-0.5"
      >
        {/* 封面区域 */}
        <div
          className={cn(
            "relative h-48 flex flex-col items-center justify-center border-2 rounded-xl p-4",
            cover.bg
          )}
        >
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
            />
          ) : (
            <BookOpen className={cn("size-12 mb-2", cover.accent, "opacity-60")} />
          )}
          <h3
            className={cn(
              "relative text-lg font-bold text-center line-clamp-2 px-2",
              book.coverImage ? "text-white drop-shadow-lg" : cover.accent
            )}
          >
            {book.title}
          </h3>
          <p
            className={cn(
              "relative text-xs mt-1",
              book.coverImage ? "text-white/80" : "opacity-50"
            )}
          >
            {cover.label} · {pageCount} 页
          </p>
        </div>

        {/* 操作栏 */}
        <div className="flex items-center divide-x divide-stone-100 dark:divide-stone-700 border-t border-stone-100 dark:border-stone-700 bg-white dark:bg-stone-800">
          <Link
            href={`/book/${book.id}/read`}
            className="flex-1 flex items-center justify-center gap-1 py-2.5 text-sm text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors"
          >
            <Eye className="size-3.5" />
            <span>阅读</span>
          </Link>
          <Link
            href={`/book/${book.id}/edit`}
            className="flex-1 flex items-center justify-center gap-1 py-2.5 text-sm text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors"
          >
            <Edit3 className="size-3.5" />
            <span>编辑</span>
          </Link>
        </div>
      </Link>
    </div>
  );
}
