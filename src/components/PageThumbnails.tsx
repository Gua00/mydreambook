"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Page } from "@/types";
import { cn } from "@/lib/utils";

interface PageThumbnailsProps {
  pages: Page[];
  currentPage: number;
  onSelectPage: (pageNum: number) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
}

/** 左侧页面缩略图列表（移动端可折叠） */
export function PageThumbnails({
  pages,
  currentPage,
  onSelectPage,
  onAddPage,
  onDeletePage,
}: PageThumbnailsProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* 折叠按钮（移动端显示在外部） */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-r-lg shadow-sm"
        title={collapsed ? "展开页面列表" : "收起页面列表"}
      >
        {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
      </button>

      <div
        className={cn(
          "shrink-0 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-700 flex flex-col h-full transition-all duration-300",
          collapsed ? "w-0 overflow-hidden border-r-0" : "w-48"
        )}
      >
        {/* 标题 */}
        <div className="px-3 py-3 border-b border-stone-100 dark:border-stone-700 flex items-center justify-between">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 whitespace-nowrap">
            页面 ({pages.length})
          </span>
          <button
            onClick={onAddPage}
            className="p-1 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors"
            title="添加页面"
          >
            <Plus className="size-4" />
          </button>
        </div>

        {/* 缩略图列表 */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {pages.map((page, idx) => (
            <div
              key={page.id}
              onClick={() => onSelectPage(idx)}
              className={cn(
                "group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all",
                currentPage === idx
                  ? "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 ring-1 ring-amber-300 dark:ring-amber-700"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
              )}
            >
              {/* 缩略图预览 */}
              <div
                className={cn(
                  "w-14 h-20 rounded border bg-white dark:bg-stone-700 overflow-hidden shrink-0",
                  currentPage === idx ? "border-amber-300 dark:border-amber-600" : "border-stone-200 dark:border-stone-600"
                )}
              >
                <div className="w-full h-full scale-[0.25] origin-top-left">
                  {page.content.elements.map((el) => (
                    <div
                      key={el.id}
                      className="absolute"
                      style={{
                        left: el.x, top: el.y,
                        width: el.width, height: el.height,
                      }}
                    >
                      {el.type === "text" && "data" in el && (
                        <div className="text-[8px] overflow-hidden" style={{
                          fontFamily: (el.data as { font?: string }).font,
                          color: (el.data as { color?: string }).color,
                        }}>
                          {(el.data as { content?: string }).content?.slice(0, 10)}
                        </div>
                      )}
                      {el.type === "image" && (
                        <div className="w-full h-full bg-stone-200 dark:bg-stone-600 rounded" />
                      )}
                      {el.type === "doodle" && (
                        <div className="w-full h-full bg-stone-300 dark:bg-stone-500 rounded" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 页码 */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium whitespace-nowrap">第 {idx + 1} 页</div>
                <div className="text-[10px] text-stone-400 dark:text-stone-500">
                  {page.content.elements.length} 个元素
                </div>
              </div>

              {/* 删除按钮 */}
              {pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(page.id);
                  }}
                  className="p-0.5 rounded text-stone-300 dark:text-stone-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  title="删除页面"
                >
                  <Trash2 className="size-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
