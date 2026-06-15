"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Edit3, Share2, Download, FileText, Image } from "lucide-react";
import { useBookStore } from "@/stores/bookStore";
import { useEditorStore } from "@/stores/editorStore";
import { BookReader } from "@/components/BookReader";
import { cn } from "@/lib/utils";

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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!book) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-stone-500">加载中...</p>
      </div>
    );
  }

  const styleClass = styleClassMap[book.style] || "theme-light";
  const sortedPages = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);

  /** 渲染页面元素到 DOM */
  const renderPageElements = (page: typeof sortedPages[0], container: HTMLElement) => {
    page.content.elements.forEach((el) => {
      const div = document.createElement("div");
      div.style.cssText = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;`;
      if (el.type === "text") {
        div.textContent = (el.data as { content?: string }).content || "";
        div.style.fontFamily = (el.data as { font?: string }).font || "sans-serif";
        div.style.fontSize = `${(el.data as { size?: number }).size || 16}px`;
        div.style.color = (el.data as { color?: string }).color || "#000";
        div.style.whiteSpace = "pre-wrap";
        div.style.overflow = "hidden";
      }
      if (el.type === "image") {
        const img = document.createElement("img");
        img.src = (el.data as { src?: string }).src || "";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        div.appendChild(img);
      }
      container.appendChild(div);
    });
  };

  /** 导出为单张长图（所有页面纵向拼接） */
  const handleExportLongImage = async () => {
    if (sortedPages.length === 0) return;
    setExporting(true);
    setShowExportMenu(false);
    try {
      const { toPng } = await import("html-to-image");
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      document.body.appendChild(container);

      for (const page of sortedPages) {
        const pageDiv = document.createElement("div");
        pageDiv.style.width = "800px";
        pageDiv.style.height = "1000px";
        pageDiv.style.position = "relative";
        pageDiv.style.overflow = "hidden";
        pageDiv.className = styleClass;
        renderPageElements(page, pageDiv);
        container.appendChild(pageDiv);
      }

      await new Promise((r) => setTimeout(r, 200));
      const dataUrl = await toPng(container, { quality: 0.92 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${book.title}_完整版.png`;
      a.click();
      document.body.removeChild(container);
    } catch {
      alert("导出失败，请重试");
    } finally {
      setExporting(false);
    }
  };

  /** 导出为逐页 PNG */
  const handleExportPages = async () => {
    if (sortedPages.length === 0) return;
    setExporting(true);
    setShowExportMenu(false);
    try {
      const { toPng } = await import("html-to-image");
      for (let i = 0; i < sortedPages.length; i++) {
        const container = document.createElement("div");
        container.style.width = "800px";
        container.style.height = "1000px";
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.overflow = "hidden";
        container.className = styleClass;
        document.body.appendChild(container);
        renderPageElements(sortedPages[i], container);

        await new Promise((r) => setTimeout(r, 100));
        const dataUrl = await toPng(container, { quality: 0.95 });
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${book.title}_第${i + 1}页.png`;
        a.click();
        document.body.removeChild(container);
        await new Promise((r) => setTimeout(r, 150)); // 防止浏览器拦截多个下载
      }
    } catch {
      alert("导出失败，请重试");
    } finally {
      setExporting(false);
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
      <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft className="size-4" />
          书架
        </button>
        <div className="w-px h-4 bg-stone-200 dark:bg-stone-700" />
        <h1 className="text-sm font-bold text-stone-800 dark:text-stone-200 truncate max-w-xs">{book.title}</h1>
        <span className="text-xs text-stone-400">{sortedPages.length} 页</span>
        <div className="flex-1" />
        <button
          onClick={() => router.push(`/book/${bookId}/edit`)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
        >
          <Edit3 className="size-3.5" />
          编辑
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
        >
          <Share2 className="size-3.5" />
          分享
        </button>

        {/* 导出下拉 */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={exporting}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 rounded-lg transition-colors disabled:opacity-50"
          >
            <Download className="size-3.5" />
            {exporting ? "导出中..." : "导出"}
          </button>
          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white dark:bg-stone-800 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden animate-fade-in">
                <button
                  onClick={handleExportLongImage}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                >
                  <FileText className="size-3.5" />
                  导出为长图
                </button>
                <button
                  onClick={handleExportPages}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                >
                  <Image className="size-3.5" />
                  导出逐页 PNG
                </button>
              </div>
            </>
          )}
        </div>
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
