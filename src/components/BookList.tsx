"use client";

import { useBookStore } from "@/stores/bookStore";
import { useEditorStore } from "@/stores/editorStore";
import { BookCard } from "./BookCard";
import { CreateBookModal } from "./CreateBookModal";
import { useState, useMemo } from "react";
import { Plus, BookHeart, Search, X } from "lucide-react";

/** 书架网格列表 */
export function BookList() {
  const { books, deleteBook } = useBookStore();
  const pages = useEditorStore((s) => s.pages);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /** 计算每本书的页数 */
  const getPageCount = (bookId: string) =>
    pages.filter((p) => p.bookId === bookId).length;

  /** 按搜索词过滤书籍 */
  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const q = searchQuery.toLowerCase().trim();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q)
    );
  }, [books, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 标题区 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">📚 我的书架</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {books.length === 0
              ? "创建你的第一本梦想之书吧 ✨"
              : `共 ${books.length} 本梦想之书`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 搜索框 */}
          {books.length > 0 && (
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索书名..."
                className="w-full sm:w-48 pl-9 pr-8 py-2 text-sm border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-stone-400 hover:text-stone-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="size-4" />
            创建新书
          </button>
        </div>
      </div>

      {/* 空状态 */}
      {books.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400 dark:text-stone-500">
          <BookHeart className="size-20 mb-4 opacity-30" />
          <p className="text-lg font-medium">还没有梦想之书</p>
          <p className="text-sm mt-1">点击"创建新书"开始记录你的梦想吧</p>
        </div>
      )}

      {/* 搜索无结果 */}
      {books.length > 0 && filteredBooks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-stone-400">
          <Search className="size-12 mb-3 opacity-30" />
          <p className="text-sm">没有找到包含"{searchQuery}"的书籍</p>
        </div>
      )}

      {/* 书籍网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredBooks.map((book) => (
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
