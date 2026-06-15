"use client";

import { useState, useRef, useCallback } from "react";
import type { Page, PageElement, TextElementData, ImageElementData } from "@/types";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface CanvasEditorProps {
  page: Page;
  selectedElements: string[];
  onSelectElement: (id: string) => void;
  onClearSelection: () => void;
  onUpdateElement: (elementId: string, changes: Partial<PageElement>) => void;
  onRemoveElement: (elementId: string) => void;
  onAddElement: (element: PageElement) => void;
  styleClass: string;
}

/** 自由画布编辑器 — 支持文字/图片/涂鸦元素的拖拽和编辑 */
export function CanvasEditor({
  page,
  selectedElements,
  onSelectElement,
  onClearSelection,
  onUpdateElement,
  onRemoveElement,
  onAddElement,
  styleClass,
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingText, setEditingText] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  /** 画布空白区点击 → 取消选中 */
  const handleCanvasClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target === canvasRef.current || target.dataset.canvas === "true") {
      onClearSelection();
    }
  };

  /** 开始拖拽元素 */
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    onSelectElement(elementId);

    const el = page.content.elements.find((el) => el.id === elementId);
    if (!el) return;

    setDragging(elementId);
    setDragOffset({ x: e.clientX - el.x, y: e.clientY - el.y });
  };

  /** 拖拽移动 */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const newX = Math.max(0, e.clientX - dragOffset.x);
      const newY = Math.max(0, e.clientY - dragOffset.y);
      onUpdateElement(dragging, { x: newX, y: newY });
    },
    [dragging, dragOffset, onUpdateElement]
  );

  /** 结束拖拽 */
  const handleMouseUp = () => setDragging(null);

  /** 双击文字元素 → 进入编辑 */
  const handleDoubleClick = (el: PageElement) => {
    if (el.type === "text") {
      const data = el.data as TextElementData;
      setEditingText(el.id);
      setEditValue(data.content || "");
    }
  };

  /** 文字编辑完成 */
  const finishEditing = () => {
    if (!editingText) return;
    const currentData = page.content.elements.find((el) => el.id === editingText)?.data;
    onUpdateElement(editingText, {
      data: { ...currentData, content: editValue } as TextElementData,
    });
    setEditingText(null);
  };

  /** 计算图片 CSS filter */
  const getImageFilter = (el: PageElement): string => {
    if (el.type !== "image") return "none";
    const f = (el.data as ImageElementData).filter;
    if (!f) return "none";
    return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%)`;
  };

  return (
    <div className="flex-1 flex items-start justify-center p-4 overflow-auto bg-stone-200/50">
      {/* 书页画布 */}
      <div
        ref={canvasRef}
        data-canvas="true"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={cn(
          "relative w-full max-w-[800px] min-h-[1000px] rounded-xl book-shadow border border-stone-300/50 select-none",
          styleClass
        )}
        style={{ aspectRatio: "4/5" }}
      >
        {/* 页码 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs opacity-40 pointer-events-none">
          第 {page.pageNumber + 1} 页
        </div>

        {/* 渲染所有元素 */}
        {page.content.elements.map((el) => {
          const isSelected = selectedElements.includes(el.id);
          const isEditing = editingText === el.id;

          return (
            <div
              key={el.id}
              onMouseDown={(e) => handleMouseDown(e, el.id)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleDoubleClick(el);
              }}
              className={cn(
                "absolute group",
                isSelected && "ring-2 ring-amber-500 ring-offset-1 z-10",
                dragging === el.id && "opacity-80 z-20",
                el.type !== "text" && "cursor-move"
              )}
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
              }}
            >
              {/* ── 文字元素 ── */}
              {el.type === "text" && (
                <div className="w-full h-full cursor-text">
                  {isEditing ? (
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={finishEditing}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") finishEditing();
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          finishEditing();
                        }
                      }}
                      className="w-full h-full p-2 border-2 border-amber-400 rounded resize-none focus:outline-none bg-white/90"
                      style={{
                        fontFamily: (el.data as TextElementData).font,
                        fontSize: (el.data as TextElementData).size,
                        color: (el.data as TextElementData).color,
                      }}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="w-full h-full overflow-hidden whitespace-pre-wrap p-2 cursor-text hover:bg-black/5 rounded transition-colors"
                      style={{
                        fontFamily: (el.data as TextElementData).font || "sans-serif",
                        fontSize: (el.data as TextElementData).size || 16,
                        color: (el.data as TextElementData).color || "#333",
                      }}
                    >
                      {(el.data as TextElementData).content || (
                        <span className="opacity-30">双击编辑文字</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── 图片元素 ── */}
              {el.type === "image" && (
                <div className="w-full h-full overflow-hidden rounded-lg shadow-sm">
                  <img
                    src={(el.data as ImageElementData).src}
                    alt=""
                    className="w-full h-full object-cover pointer-events-none"
                    style={{ filter: getImageFilter(el) }}
                    draggable={false}
                  />
                </div>
              )}

              {/* ── 涂鸦元素 ── */}
              {el.type === "doodle" && "data" in el && (
                <img
                  src={(el.data as DoodleElementData).svgPath}
                  alt="涂鸦"
                  className="w-full h-full object-contain pointer-events-none"
                  draggable={false}
                />
              )}

              {/* ── 选中指示器 + 删除按钮 ── */}
              {isSelected && (
                <>
                  <div className="absolute -top-1 -left-1 size-2.5 bg-amber-500 rounded-full shadow" />
                  <div className="absolute -top-1 -right-1 size-2.5 bg-amber-500 rounded-full shadow" />
                  <div className="absolute -bottom-1 -left-1 size-2.5 bg-amber-500 rounded-full shadow" />
                  <div className="absolute -bottom-1 -right-1 size-2.5 bg-amber-500 rounded-full shadow" />
                  <button
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onRemoveElement(el.id);
                    }}
                    className="absolute -top-2 -right-2 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-30"
                    title="删除元素"
                  >
                    <X className="size-3" />
                  </button>
                </>
              )}
            </div>
          );
        })}

        {/* 空状态提示 */}
        {page.content.elements.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 pointer-events-none">
            <p className="text-lg font-medium">空白页</p>
            <p className="text-sm mt-1">点击上方「文字 / 图片 / 涂鸦」添加内容</p>
            <p className="text-xs mt-3 opacity-60">拖拽元素调整位置 · 双击文字进行编辑</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 类型重导出
export type { CanvasEditorProps };

// 内联 import — 避免循环依赖
import type { DoodleElementData } from "@/types";
