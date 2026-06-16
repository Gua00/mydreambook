"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Page, TextElementData, ImageElementData, DoodleElementData } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

// react-pageflip 依赖 DOM API，需要动态导入
const HTMLFlipBook = dynamic(
  () => import("react-pageflip"),
  { ssr: false }
) as any;

interface BookReaderProps {
  pages: Page[];
  styleClass: string;
  flipMode: "3d" | "swipe";
}

/* ──────────── 单页内容渲染 ──────────── */
function PageFace({ page, styleClass }: { page: Page; styleClass: string }) {
  return (
    <div className={cn("w-full h-full overflow-hidden relative", styleClass)}>
      {page.content.elements.map((el) => (
        <div
          key={el.id}
          className="absolute"
          style={{ left: el.x, top: el.y, width: el.width, height: el.height }}
        >
          {el.type === "text" && (
            <div
              className="w-full h-full overflow-hidden whitespace-pre-wrap p-1 select-none"
              style={{
                fontFamily: (el.data as TextElementData).font,
                fontSize: (el.data as TextElementData).size,
                color: (el.data as TextElementData).color,
              }}
            >
              {(el.data as TextElementData).content}
            </div>
          )}

          {el.type === "image" && (
            <div className="w-full h-full overflow-hidden rounded">
              <img
                src={(el.data as ImageElementData).src}
                alt=""
                className="w-full h-full object-cover"
                style={{
                  filter: (() => {
                    const f = (el.data as ImageElementData).filter;
                    if (!f) return "none";
                    return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%)`;
                  })(),
                }}
                draggable={false}
              />
            </div>
          )}

          {el.type === "doodle" && (
            <img
              src={(el.data as DoodleElementData).svgPath}
              alt="涂鸦"
              className="w-full h-full object-contain"
              draggable={false}
            />
          )}
        </div>
      ))}

      {page.content.elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center opacity-25 select-none pointer-events-none">
          <p className="text-sm">空白页</p>
        </div>
      )}

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] opacity-30 select-none pointer-events-none">
        {page.pageNumber + 1}
      </div>
    </div>
  );
}

/* ──────────── React-PageFlip 3D 翻书模式 ──────────── */
function FlipBook({ pages, styleClass }: { pages: Page[]; styleClass: string }) {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [mounted, setMounted] = useState(false);
  const totalPages = pages.length;

  // 客户端挂载后再渲染 HTMLFlipBook（需要 DOM API）
  useEffect(() => { setMounted(true); }, []);

  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  const goToPage = (n: number) => {
    if (n >= 0 && n < totalPages) {
      bookRef.current?.pageFlip()?.flip(n);
    }
  };

  const goNext = () => goToPage(currentPage + 1);
  const goPrev = () => goToPage(currentPage - 1);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-stone-100 dark:bg-stone-950 select-none">
      <div className="flex items-center gap-4 w-full max-w-[1000px] justify-center">
        <button
          onClick={goPrev}
          disabled={currentPage <= 0}
          className="p-3 rounded-full bg-white dark:bg-stone-800 shadow-md text-stone-600 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-700 hover:scale-105 disabled:opacity-25 disabled:hover:scale-100 transition-all shrink-0"
          aria-label="上一页"
        >
          <ChevronLeft className="size-5" />
        </button>

        <div className="flex-1 flex justify-center overflow-hidden">
          {mounted ? (
            <HTMLFlipBook
              ref={bookRef}
              width={400}
              height={500}
              size="stretch"
              minWidth={250}
              maxWidth={550}
              minHeight={320}
              maxHeight={700}
              maxShadowOpacity={0.4}
              showCover={true}
              mobileScrollSupport={true}
              onFlip={onFlip}
              className="book-shadow"
              style={{}}
              startPage={0}
              drawShadow={true}
              flippingTime={800}
              usePortrait={false}
              startZIndex={0}
              autoSize={true}
              useMouseEvents={true}
              swipeDistance={30}
              showPageCorners={true}
              disableFlipByClick={false}
            >
              {pages.map((page) => (
                <div key={page.id} className="w-full h-full">
                  <PageFace page={page} styleClass={styleClass} />
                </div>
              ))}
            </HTMLFlipBook>
          ) : (
            /* 骨架占位，防止布局跳动 */
            <div className="w-full max-w-[550px] book-shadow rounded-xl overflow-hidden bg-white dark:bg-stone-800 animate-pulse"
              style={{ aspectRatio: "4/5" }}>
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="size-12 text-stone-200 dark:text-stone-600" />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={goNext}
          disabled={currentPage >= totalPages - 1}
          className="p-3 rounded-full bg-white dark:bg-stone-800 shadow-md text-stone-600 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-700 hover:scale-105 disabled:opacity-25 disabled:hover:scale-100 transition-all shrink-0"
          aria-label="下一页"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
        <BookOpen className="size-3" />
        <span>{currentPage + 1}</span>
        <span>/</span>
        <span>{totalPages}</span>
      </div>
    </div>
  );
}

/* ──────────── 滑动模式 ──────────── */
function SwipeReader({ pages, styleClass }: { pages: Page[]; styleClass: string }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const totalPages = pages.length;

  const goToPage = (target: number) => {
    if (target < 0 || target >= totalPages) return;
    setCurrentPage(target);
    setTranslateX(0);
  };

  return (
    <div
      className="flex-1 flex items-center justify-center p-4 bg-stone-200/50 dark:bg-stone-900/50 overflow-hidden"
      onTouchStart={(e) => { setTouchStart(e.touches[0].clientX); setIsSwiping(true); }}
      onTouchMove={(e) => { if (isSwiping) setTranslateX(e.touches[0].clientX - touchStart); }}
      onTouchEnd={() => {
        setIsSwiping(false);
        if (Math.abs(translateX) > 80) {
          translateX > 0 ? goToPage(currentPage - 1) : goToPage(currentPage + 1);
        }
        setTranslateX(0);
      }}
    >
      <div className="flex items-center gap-4 max-w-4xl w-full">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-3 rounded-full bg-white dark:bg-stone-800 shadow-sm text-stone-600 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-700 disabled:opacity-30 transition-all shrink-0"
          aria-label="上一页"
        >
          <ChevronLeft className="size-6" />
        </button>

        <div className="flex-1 overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(calc(-${currentPage * 100}% + ${isSwiping ? translateX : 0}px))`,
            }}
          >
            {pages.map((page) => (
              <div
                key={page.id}
                className="w-full shrink-0 book-shadow rounded-xl overflow-hidden"
                style={{ aspectRatio: "4/5" }}
              >
                <PageFace page={page} styleClass={styleClass} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-3 rounded-full bg-white dark:bg-stone-800 shadow-sm text-stone-600 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-700 disabled:opacity-30 transition-all shrink-0"
          aria-label="下一页"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>

      {/* 圆点指示器 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i === currentPage
                ? "bg-amber-500 w-4"
                : "bg-stone-300 dark:bg-stone-600 hover:bg-stone-400"
            )}
          />
        ))}
      </div>
    </div>
  );
}

/* ──────────── 阅读器入口 ──────────── */
export function BookReader({ pages, styleClass, flipMode }: BookReaderProps) {
  if (pages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-stone-500 dark:text-stone-400">这本书还没有页面</p>
      </div>
    );
  }

  if (flipMode === "swipe") {
    return <SwipeReader pages={pages} styleClass={styleClass} />;
  }

  return <FlipBook pages={pages} styleClass={styleClass} />;
}
