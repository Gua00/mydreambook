"use client";

import { useState } from "react";
import Link from "next/link";
import { useBookStore } from "@/stores/bookStore";
import { useEditorStore } from "@/stores/editorStore";
import { useExploreStore } from "@/stores/exploreStore";
import { Heart, MessageCircle, BookOpen, Clock, TrendingUp, Send, User } from "lucide-react";
import type { DreamBook, Interaction } from "@/types";
import { cn } from "@/lib/utils";

/** 单张公开书卡片 */
function ExploreBookCard({
  book,
  pageCount,
  interactions,
  onLike,
  onComment,
}: {
  book: DreamBook;
  pageCount: number;
  interactions: Interaction[];
  onLike: (nickname: string) => void;
  onComment: (nickname: string, content: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [nickname, setNickname] = useState("");
  const [commentText, setCommentText] = useState("");
  const [likeNickname, setLikeNickname] = useState("");

  const likes = interactions.filter((i) => i.type === "like");
  const comments = interactions.filter((i) => i.type === "comment");
  const hasLiked = likes.some((l) => l.nickname === likeNickname && likeNickname);

  const styleCovers: Record<string, string> = {
    vintage: "bg-amber-100 border-amber-300",
    starry: "bg-indigo-950 border-indigo-600 text-white",
    light: "bg-white border-stone-200",
    dark: "bg-stone-900 border-stone-600 text-white",
  };

  const coverClass = styleCovers[book.style] || styleCovers.light;
  const isDark = book.style === "starry" || book.style === "dark";

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl book-shadow overflow-hidden animate-fade-in">
      {/* 封面 */}
      <Link href={`/share/${book.id}`} className="block">
        <div
          className={cn(
            "relative h-40 flex items-center justify-center border-b-2",
            coverClass
          )}
        >
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <BookOpen className={cn("size-10", isDark ? "opacity-60" : "opacity-30")} />
          )}
          <h3 className={cn(
            "relative text-lg font-bold text-center px-2 line-clamp-2",
            book.coverImage ? "text-white drop-shadow-lg" : isDark ? "text-white/80" : "text-stone-700"
          )}>
            {book.title}
          </h3>
        </div>
      </Link>

      <div className="p-3">
        {/* 元信息 */}
        <div className="flex items-center gap-2 text-xs text-stone-400 mb-3">
          <span>{pageCount} 页</span>
          <span>·</span>
          <span>{new Date(book.createdAt).toLocaleDateString("zh-CN")}</span>
        </div>

        {/* 互动区 */}
        <div className="flex items-center gap-2 mb-3">
          {/* 点赞 */}
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="昵称"
              value={likeNickname}
              onChange={(e) => setLikeNickname(e.target.value)}
              className="w-16 text-xs border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <button
              onClick={() => {
                if (!likeNickname.trim()) return;
                onLike(likeNickname.trim());
              }}
              className={cn(
                "flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors",
                hasLiked
                  ? "bg-red-50 text-red-500"
                  : "bg-stone-100 text-stone-500 hover:bg-red-50 hover:text-red-400"
              )}
            >
              <Heart className={cn("size-3.5", hasLiked && "fill-current")} />
              {likes.length}
            </button>
          </div>

          {/* 评论按钮 */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs bg-stone-100 text-stone-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
          >
            <MessageCircle className="size-3.5" />
            {comments.length}
          </button>
        </div>

        {/* 评论区 */}
        {showComments && (
          <div className="border-t border-stone-100 pt-3">
            {/* 评论列表 */}
            {comments.length > 0 && (
              <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                {comments.map((c) => (
                  <div key={c.id} className="text-xs">
                    <span className="font-medium text-stone-600">{c.nickname}</span>
                    <span className="text-stone-500 ml-1">{c.content}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 发评论 */}
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="昵称"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-16 text-xs border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400 shrink-0"
              />
              <input
                type="text"
                placeholder="写评论..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && nickname.trim() && commentText.trim()) {
                    onComment(nickname.trim(), commentText.trim());
                    setCommentText("");
                  }
                }}
                className="flex-1 text-xs border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <button
                onClick={() => {
                  if (!nickname.trim() || !commentText.trim()) return;
                  onComment(nickname.trim(), commentText.trim());
                  setCommentText("");
                }}
                disabled={!nickname.trim() || !commentText.trim()}
                className="p-1.5 rounded-lg bg-amber-500 text-white disabled:opacity-30 hover:bg-amber-600 transition-colors shrink-0"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** 公开墙页面 */
export default function ExplorePage() {
  const books = useBookStore((s) => s.books.filter((b) => b.isPublic));
  const pages = useEditorStore((s) => s.pages);
  const { interactions, addLike, addComment, getInteractions } = useExploreStore();
  const [sortBy, setSortBy] = useState<"new" | "hot">("new");

  const getPageCount = (bookId: string) =>
    pages.filter((p) => p.bookId === bookId).length;

  const getInteractionCount = (bookId: string) => {
    const ints = interactions[bookId] || [];
    return ints.filter((i) => i.type === "like").length + ints.filter((i) => i.type === "comment").length;
  };

  // 排序
  const sortedBooks = [...books].sort((a, b) => {
    if (sortBy === "hot") {
      return getInteractionCount(b.id) - getInteractionCount(a.id);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">🌍 公开墙</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            探索大家分享的梦想之书
          </p>
        </div>

        {/* 排序切换 */}
        <div className="flex bg-stone-100 rounded-xl p-0.5">
          <button
            onClick={() => setSortBy("new")}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              sortBy === "new" ? "bg-white text-amber-700 shadow-sm" : "text-stone-500"
            )}
          >
            <Clock className="size-3.5" />
            最新
          </button>
          <button
            onClick={() => setSortBy("hot")}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              sortBy === "hot" ? "bg-white text-amber-700 shadow-sm" : "text-stone-500"
            )}
          >
            <TrendingUp className="size-3.5" />
            热门
          </button>
        </div>
      </div>

      {/* 空状态 */}
      {sortedBooks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <BookOpen className="size-20 mb-4 opacity-30" />
          <p className="text-lg font-medium">还没有公开的梦想之书</p>
          <p className="text-sm mt-1">去创建一本并设为公开吧</p>
        </div>
      )}

      {/* 书籍网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedBooks.map((book) => (
          <ExploreBookCard
            key={book.id}
            book={book}
            pageCount={getPageCount(book.id)}
            interactions={interactions[book.id] || []}
            onLike={(nickname) => addLike(book.id, nickname)}
            onComment={(nickname, content) => addComment(book.id, nickname, content)}
          />
        ))}
      </div>
    </div>
  );
}
