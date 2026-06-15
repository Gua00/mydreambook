"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Page, PageElement, PageElementType, TextElementData, ImageElementData } from "@/types";
import { generateId, defaultFilter, cn } from "@/lib/utils";
import { X, Grip } from "lucide-react";

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

/** 自由画布编辑器 — 支持文字/图片/涂鸦元素的拖拽和缩放 */
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** 获取页面样式类 */
  const themeClass = `theme-${page ? "light" : "light"}`;

  /** 处理画布点击（取消选中） */
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvas === "true") {
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
    setDragOffset({
      x: e.clientX - el.x,
      y: e.clientY - el.y,
    });
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
  const handleMouseUp = () => {
    setDragging(null);
  };

  /** 双击文字元素编辑 */
  const handleDoubleClick = (el: PageElement) => {
    if (el.type === "text") {
      const data = el.data as TextElementData;
      setEditingText(el.id);
      setEditValue(data.content);
    }
  };

  /** 文字编辑完成 */
  const finishEditing = () => {
    if (editingText) {
      onUpdateElement(editingText, {
        data: {
          ...page.content.elements.find((el) => el.id === editingText)?.data,
          content: editValue,
        } as TextElementData,
      });
      setEditingText(null);
    }
  };

  /** 处理图片上传 */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const element: PageElement = {
        id: generateId(),
        type: "image",
        x: 50,
        y: 50,
        width: 300,
        height: 200,
        data: { src, filter: { ...defaultFilter } } as ImageElementData,
      };
      onAddElement(element);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** 获取选中元素 */
  const selectedEl = page.content.elements.find((el) =>
    selectedElements.includes(el.id)
  );

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
          "relative w-full max-w-[800px] min-h-[1000px] rounded-xl book-shadow border border-stone-300/50",
          styleClass
        )}
        style={{ aspectRatio: "4/5" }}
      >
        {/* 页码 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs opacity-40 select-none">
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
              onDoubleClick={() => handleDoubleClick(el)}
              className={cn(
                "absolute group cursor-move select-none",
                isSelected && "ring-2 ring-amber-500 ring-offset-1 z-10",
                dragging === el.id && "opacity-80 z-20"
              )}
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
              }}
            >
              {/* 文字元素 */}
              {el.type === "text" && (
                <div className="w-full h-full">
                  {isEditing ? (
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={finishEditing}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") finishEditing();
                      }}
                      className="w-full h-full p-2 border border-amber-400 rounded resize-none focus:outline-none text-inherit"
                      style={{
                        fontFamily: (el.data as TextElementData).font,
                        fontSize: (el.data as TextElementData).size,
                        color: (el.data as TextElementData).color,
                      }}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="w-full h-full overflow-hidden whitespace-pre-wrap p-1"
                      style={{
                        fontFamily: (el.data as TextElementData).font,
                        fontSize: (el.data as TextElementData).size,
                        color: (el.data as TextElementData).color,
                      }}
                    >
                      {(el.data as TextElementData).content || "双击编辑文字"}
                    </div>
                  )}
                </div>
              )}

              {/* 图片元素 */}
              {el.type === "image" && (
                <div className="w-full h-full overflow-hidden rounded">
                  <img
                    src={(el.data as ImageElementData).src}
                    alt=""
                    className="w-full h-full object-cover pointer-events-none"
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

              {/* 涂鸦元素 */}
              {el.type === "doodle" && "data" in el && (
                <svg className="w-full h-full pointer-events-none">
                  <path
                    d={(el.data as { svgPath?: string }).svgPath || ""}
                    stroke={(el.data as { strokeColor?: string }).strokeColor || "#000"}
                    strokeWidth={(el.data as { strokeWidth?: number }).strokeWidth || 3}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}

              {/* 选中指示器 */}
              {isSelected && (
                <>
                  <div className="absolute -top-1 -left-1 size-2 bg-amber-500 rounded-full" />
                  <div className="absolute -top-1 -right-1 size-2 bg-amber-500 rounded-full" />
                  <div className="absolute -bottom-1 -left-1 size-2 bg-amber-500 rounded-full" />
                  <div className="absolute -bottom-1 -right-1 size-2 bg-amber-500 rounded-full" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveElement(el.id);
                    }}
                    className="absolute -top-2 -right-2 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
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
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 select-none pointer-events-none">
            <p className="text-lg">点击上方"文字/图片/涂鸦"添加内容</p>
            <p className="text-sm mt-1">拖拽元素调整位置，双击文字进行编辑</p>
          </div>
        )}
      </div>

      {/* 隐藏的图片上传 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}

/** 暴露添加图片的方法供父组件调用 */
export type { CanvasEditorProps };
