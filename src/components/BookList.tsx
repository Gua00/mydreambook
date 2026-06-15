"use client";

import { useBookStore } from "@/stores/bookStore";
import { useEditorStore } from "@/stores/editorStore";
import { BookCard } from "./BookCard";
import { CreateBookModal } from "./CreateBookModal";
import { useState } from "react";
import { Plus, BookHeart } from "lucide-react";

/** 书架网格列表 */
export function BookList() {
  const { books, deleteBook } = useBookStore();
  const pages = useEditorStore((s) => s.pages);
  const [showCreate, setShowCreate] = useState(false);

  /** 计算每本书的页数 */
  const getPageCount = (bookId: string) =>
    pages.filter((p) => p.bookId === bookId).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 标题区 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">📚 我的书架</h1>
          <p className="text-sm text-stone-500 mt-1">
            {books.length === 0
              ? "创建你的第一本梦想之书吧 ✨"
              : `共 ${books.length} 本梦想之书`}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="size-4" />
          创建新书
        </button>
      </div>

      {/* 空状态 */}
      {books.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <BookHeart className="size-20 mb-4 opacity-30" />
          <p className="text-lg font-medium">还没有梦想之书</p>
          <p className="text-sm mt-1">点击"创建新书"开始记录你的梦想吧</p>
        </div>
      )}

      {/* 书籍网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            pageCount={getPageCount(book.id)}
            onDelete={deleteBook}
          />
        ))}
      </div>

      {/* 创建弹窗 */}
      <CreateBookModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}
