"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Page, PageElement, TextElementData, ImageElementData, DoodleElementData } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BookReaderProps {
  pages: Page[];
  styleClass: string;
  flipMode: "3d" | "swipe";
}

/** 渲染单个页面内容 */
function PageContent({ page, styleClass }: { page: Page; styleClass: string }) {
  return (
    <div className={cn("relative w-full h-full overflow-hidden", styleClass)}>
      {page.content.elements.map((el) => (
        <div
          key={el.id}
          className="absolute"
          style={{
            left: el.x,
            top: el.y,
            width: el.width,
            height: el.height,
          }}
        >
          {/* 文字 */}
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

          {/* 图片 */}
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

          {/* 涂鸦 */}
          {el.type === "doodle" && "data" in el && (
            <img
              src={(el.data as DoodleElementData).svgPath}
              alt="涂鸦"
              className="w-full h-full object-contain"
              draggable={false}
            />
          )}
        </div>
      ))}

      {/* 空页面 */}
      {page.content.elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30 select-none">
          <p className="text-lg">空白页</p>
        </div>
      )}

      {/* 页码 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs opacity-40 select-none">
        第 {page.pageNumber + 1} 页
      </div>
    </div>
  );
}

/** 3D 翻页阅读器组件 */
function FlipBookReader({ pages, styleClass }: { pages: Page[]; styleClass: string }) {
  const bookRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"left" | "right" | null>(null);
  const [flipProgress, setFlipProgress] = useState(0);

  const totalPages = pages.length;

  /** CSS 3D 翻页动画 */
  const flipToPage = useCallback(
    (target: number) => {
      if (target < 0 || target >= totalPages || isFlipping) return;
      setIsFlipping(true);
      setFlipDirection(target > currentPage ? "left" : "right");

      // 动画过程
      const duration = 600;
      const startTime = Date.now();
      const startPage = currentPage;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeInOutCubic
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        setFlipProgress(eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCurrentPage(target);
          setIsFlipping(false);
          setFlipDirection(null);
          setFlipProgress(0);
        }
      };

      requestAnimationFrame(animate);
    },
    [currentPage, totalPages, isFlipping]
  );

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-stone-800/50">
      <div className="flex items-center gap-4 max-w-4xl w-full">
        {/* 左翻页按钮 */}
        <button
          onClick={() => flipToPage(currentPage - 1)}
          disabled={currentPage === 0 || isFlipping}
          className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition-all"
          aria-label="上一页"
        >
          <ChevronLeft className="size-6" />
        </button>

        {/* 书页 */}
        <div ref={bookRef} className="flex-1 flex justify-center perspective-[1200px]">
          <div
            className={cn(
              "relative w-full max-w-[700px] book-shadow rounded-r-xl overflow-hidden transition-transform",
              isFlipping && flipDirection === "left" && "origin-left"
            )}
            style={{
              aspectRatio: "4/5",
              transform: isFlipping
                ? `rotateY(${flipDirection === "left" ? -flipProgress * 180 : flipProgress * 180}deg)`
                : "none",
              transformStyle: "preserve-3d",
              transition: isFlipping ? "none" : "transform 0.3s",
            }}
          >
            {/* 当前页（正面） */}
            <div
              className="absolute inset-0"
              style={{ backfaceVisibility: "hidden" }}
            >
              {pages[currentPage] && (
                <PageContent page={pages[currentPage]} styleClass={styleClass} />
              )}
            </div>

            {/* 下一页（背面，翻转时可见） */}
            {flipDirection === "left" && pages[currentPage + 1] && (
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <PageContent page={pages[currentPage + 1]} styleClass={styleClass} />
              </div>
            )}
          </div>
        </div>

        {/* 右翻页按钮 */}
        <button
          onClick={() => flipToPage(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || isFlipping}
          className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition-all"
          aria-label="下一页"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>
    </div>
  );
}

/** 滑动模式阅读器 */
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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - touchStart;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (Math.abs(translateX) > 80) {
      if (translateX > 0) {
        goToPage(currentPage - 1);
      } else {
        goToPage(currentPage + 1);
      }
    }
    setTranslateX(0);
  };

  return (
    <div
      className="flex-1 flex items-center justify-center p-4 bg-stone-200/50 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center gap-4 max-w-4xl w-full">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-3 rounded-full bg-white shadow-sm text-stone-600 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-30 transition-all"
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
                <PageContent page={page} styleClass={styleClass} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-3 rounded-full bg-white shadow-sm text-stone-600 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-30 transition-all"
          aria-label="下一页"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>

      {/* 滑动指示器 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              i === currentPage
                ? "bg-amber-500 w-4"
                : "bg-stone-300 hover:bg-stone-400"
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** 阅读器容器 — 根据 flipMode 切换 3D 翻页 / 滑动模式 */
export function BookReader({ pages, styleClass, flipMode }: BookReaderProps) {
  if (pages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-stone-500">这本书还没有页面</p>
      </div>
    );
  }

  if (flipMode === "swipe") {
    return <SwipeReader pages={pages} styleClass={styleClass} />;
  }

  return <FlipBookReader pages={pages} styleClass={styleClass} />;
}
