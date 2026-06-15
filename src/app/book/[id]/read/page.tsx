"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Share2, Download } from "lucide-react";
import { useBookStore } from "@/stores/bookStore";
import { useEditorStore } from "@/stores/editorStore";
import { BookReader } from "@/components/BookReader";
import { cn, generateId, now } from "@/lib/utils";

const styleClassMap: Record<string, string> = {
  vintage: "theme-vintage",
  starry: "theme-starry",
  light: "theme-light",
  dark: "theme-dark",
};

export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const book = useBookStore((s) => s.books.find((b) => b.id === bookId));
  const pages = useEditorStore((s) => s.pages.filter((p) => p.bookId === bookId));

  if (!book) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-stone-500">加载中...</p>
      </div>
    );
  }

  const styleClass = styleClassMap[book.style] || "theme-light";
  const sortedPages = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);

  /** 导出整本书图片 */
  const handleExportAll = async () => {
    try {
      const { toPng } = await import("html-to-image");
      alert("将依次导出每一页，请稍候...");
      for (let i = 0; i < sortedPages.length; i++) {
        // 渲染每一页到临时元素
        const container = document.createElement("div");
        container.style.width = "800px";
        container.style.height = "1000px";
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.className = styleClass;
        document.body.appendChild(container);

        // 简单渲染页面内容
        sortedPages[i].content.elements.forEach((el) => {
          const div = document.createElement("div");
          div.style.cssText = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;`;
          if (el.type === "text") {
            div.textContent = (el.data as { content?: string }).content || "";
            div.style.fontFamily = (el.data as { font?: string }).font || "";
            div.style.fontSize = `${(el.data as { size?: number }).size || 16}px`;
            div.style.color = (el.data as { color?: string }).color || "#000";
          }
          container.appendChild(div);
        });

        await new Promise((r) => setTimeout(r, 100));
        const dataUrl = await toPng(container, { quality: 0.95 });
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${book.title}_第${i + 1}页.png`;
        a.click();
        document.body.removeChild(container);
      }
    } catch {
      alert("导出失败，请重试");
    }
  };

  /** 复制分享链接 */
  const handleShare = () => {
    const url = `${window.location.origin}/share/${bookId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("📋 分享链接已复制到剪贴板！");
    }).catch(() => {
      alert(`分享链接：${url}`);
    });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* 顶部栏 */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-stone-200">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft className="size-4" />
          书架
        </button>
        <div className="w-px h-4 bg-stone-200" />
        <h1 className="text-sm font-bold text-stone-800 truncate max-w-xs">{book.title}</h1>
        <span className="text-xs text-stone-400">{sortedPages.length} 页</span>
        <div className="flex-1" />
        <button
          onClick={() => router.push(`/book/${bookId}/edit`)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Edit3 className="size-3.5" />
          编辑
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Share2 className="size-3.5" />
          分享
        </button>
        <button
          onClick={handleExportAll}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
        >
          <Download className="size-3.5" />
          导出
        </button>
      </div>

      {/* 翻页阅读区 */}
      <BookReader
        pages={sortedPages}
        styleClass={styleClass}
        flipMode={book.pageFlipMode}
      />
    </div>
  );
}
