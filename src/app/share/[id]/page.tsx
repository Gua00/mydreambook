"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen, Heart, MessageCircle, Send, Share2, ArrowLeft, Clock } from "lucide-react";
import { useBookStore } from "@/stores/bookStore";
import { useEditorStore } from "@/stores/editorStore";
import { useExploreStore } from "@/stores/exploreStore";
import { BookReader } from "@/components/BookReader";
import { cn } from "@/lib/utils";
import type { Interaction } from "@/types";

const styleClassMap: Record<string, string> = {
  vintage: "theme-vintage",
  starry: "theme-starry",
  light: "theme-light",
  dark: "theme-dark",
};

/** 分享落地页 — 只读翻页 + 互动 */
export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const book = useBookStore((s) => s.books.find((b) => b.id === bookId));
  const pages = useEditorStore((s) =>
    s.pages.filter((p) => p.bookId === bookId).sort((a, b) => a.pageNumber - b.pageNumber)
  );
  const { interactions, addLike, addComment } = useExploreStore();

  const [nickname, setNickname] = useState("");
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  if (!book) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <BookOpen className="size-16 text-stone-300" />
        <p className="text-stone-500">这本书不存在或已被删除</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
        >
          回到首页
        </button>
      </div>
    );
  }

  const bookInteractions = interactions[bookId] || [];
  const likes = bookInteractions.filter((i: Interaction) => i.type === "like");
  const comments = bookInteractions.filter((i: Interaction) => i.type === "comment");
  const styleClass = styleClassMap[book.style] || "theme-light";

  /** 复制链接 */
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert("📋 链接已复制！");
    }).catch(() => {
      alert(`分享链接：${url}`);
    });
  };

  /** 发表评论 */
  const handleComment = () => {
    if (!nickname.trim() || !commentText.trim()) return;
    addComment(bookId, nickname.trim(), commentText.trim());
    setCommentText("");
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* 顶部栏 */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-stone-200">
        <button
          onClick={() => router.push("/explore")}
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft className="size-4" />
          公开墙
        </button>
        <div className="w-px h-4 bg-stone-200" />
        <h1 className="text-sm font-bold text-stone-800 truncate max-w-xs">{book.title}</h1>
        <div className="flex-1" />
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
        >
          <Share2 className="size-3.5" />
          复制链接
        </button>
      </div>

      <div className="flex-1 flex">
        {/* 阅读区 */}
        <div className="flex-1 flex flex-col">
          <BookReader
            pages={pages}
            styleClass={styleClass}
            flipMode={book.pageFlipMode}
          />
        </div>

        {/* 右侧互动面板 */}
        <div className="w-72 shrink-0 bg-white border-l border-stone-200 flex flex-col">
          {/* 书籍信息 */}
          <div className="p-4 border-b border-stone-100">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="size-5 text-amber-600" />
              <h2 className="font-bold text-stone-800 truncate">{book.title}</h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-400">
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {new Date(book.createdAt).toLocaleDateString("zh-CN")}
              </span>
              <span>{pages.length} 页</span>
            </div>
          </div>

          {/* 互动区 */}
          <div className="p-4 border-b border-stone-100">
            <div className="flex items-center gap-3 mb-4">
              {/* 点赞 */}
              <button
                onClick={() => {
                  if (!nickname.trim()) {
                    alert("请先输入昵称");
                    return;
                  }
                  addLike(bookId, nickname.trim());
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <Heart className="size-4" />
                {likes.length}
              </button>

              {/* 评论 */}
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-500 hover:bg-amber-50 hover:text-amber-600 transition-colors text-sm font-medium"
              >
                <MessageCircle className="size-4" />
                {comments.length}
              </button>
            </div>

            {/* 昵称输入 */}
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="输入你的昵称"
              className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all mb-3"
            />

            {/* 发评论 */}
            <div className="flex gap-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder="写下你的想法..."
                className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
              />
              <button
                onClick={handleComment}
                disabled={!nickname.trim() || !commentText.trim()}
                className="p-2 rounded-xl bg-amber-500 text-white disabled:opacity-30 hover:bg-amber-600 transition-colors shrink-0"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>

          {/* 评论列表 */}
          {showComments && (
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-medium text-stone-600 mb-3">
                评论 ({comments.length})
              </h3>
              {comments.length === 0 ? (
                <p className="text-xs text-stone-400">还没有评论，来说两句吧</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c: Interaction) => (
                    <div key={c.id} className="text-sm">
                      <span className="font-medium text-stone-600">{c.nickname}</span>
                      <span className="text-stone-500 ml-1">{c.content}</span>
                      <div className="text-[10px] text-stone-300 mt-0.5">
                        {new Date(c.createdAt).toLocaleDateString("zh-CN")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
