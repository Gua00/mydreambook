"use client";

import {
  Type, Image, Pen, Undo2, Redo2, Trash2, Palette,
  Sun, Contrast, Droplets, ArrowUp, ArrowDown,
} from "lucide-react";
import type { PageElementType, ImageFilter, StyleTemplate } from "@/types";
import { cn, defaultFilter } from "@/lib/utils";

interface ToolBarProps {
  onAddElement: (type: PageElementType) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDeleteSelected: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  selectedType?: PageElementType;
  // 文字属性
  currentFont?: string;
  currentFontSize?: number;
  currentColor?: string;
  onFontChange?: (font: string) => void;
  onFontSizeChange?: (size: number) => void;
  onColorChange?: (color: string) => void;
  // 滤镜
  currentFilter?: ImageFilter;
  onFilterChange?: (filter: ImageFilter) => void;
  // 风格
  currentStyle: StyleTemplate;
  onStyleChange: (style: StyleTemplate) => void;
}

const FONTS = [
  { value: "KaiTi, STKaiti, serif", label: "楷体" },
  { value: '"Noto Serif SC", STSong, serif', label: "宋体" },
  { value: '"Ma Shan Zheng", cursive', label: "手写" },
  { value: "Geist, sans-serif", label: "无衬线" },
  { value: '"ZCOOL QingKe HuangYou", cursive', label: "创意" },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

const COLORS = [
  "#1a1a1a", "#4a3728", "#8b6914", "#d97706",
  "#dc2626", "#7c3aed", "#2563eb", "#059669",
  "#ffffff", "#e5e5e5", "#fbbf24", "#ec4899",
];

const STYLES: { value: StyleTemplate; label: string; icon: string }[] = [
  { value: "light", label: "浅色", icon: "☀️" },
  { value: "vintage", label: "做旧", icon: "📜" },
  { value: "starry", label: "星空", icon: "🌙" },
  { value: "dark", label: "深色", icon: "🌑" },
];

export function ToolBar({
  onAddElement, onUndo, onRedo, onDeleteSelected,
  canUndo, canRedo, hasSelection, selectedType,
  currentFont, currentFontSize, currentColor,
  onFontChange, onFontSizeChange, onColorChange,
  currentFilter, onFilterChange,
  currentStyle, onStyleChange,
}: ToolBarProps) {
  return (
    <div className="bg-white border-b border-stone-200 shadow-sm">
      {/* 第一行：添加元素 + 操作 */}
      <div className="flex items-center gap-0.5 px-3 py-2 overflow-x-auto">
        {/* 添加文字 */}
        <button
          onClick={() => onAddElement("text")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          title="添加文字"
        >
          <Type className="size-4" /> 文字
        </button>

        {/* 添加图片 */}
        <button
          onClick={() => onAddElement("image")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          title="添加图片"
        >
          <Image className="size-4" /> 图片
        </button>

        {/* 添加涂鸦 */}
        <button
          onClick={() => onAddElement("doodle")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          title="手写涂鸦"
        >
          <Pen className="size-4" /> 涂鸦
        </button>

        <div className="w-px h-5 bg-stone-200 mx-1" />

        {/* 撤销/重做 */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors"
          title="撤销"
        >
          <Undo2 className="size-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors"
          title="重做"
        >
          <Redo2 className="size-4" />
        </button>

        {/* 删除选中元素 */}
        {hasSelection && (
          <button
            onClick={onDeleteSelected}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            title="删除选中元素"
          >
            <Trash2 className="size-4" />
          </button>
        )}

        <div className="flex-1" />

        {/* 风格切换 */}
        <div className="flex items-center gap-0.5 bg-stone-100 rounded-lg p-0.5">
          {STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => onStyleChange(s.value)}
              className={cn(
                "px-2 py-1 rounded-md text-xs font-medium transition-colors",
                currentStyle === s.value
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              )}
              title={s.label}
            >
              {s.icon}
            </button>
          ))}
        </div>
      </div>

      {/* 第二行：属性编辑（根据选中元素类型显示） */}
      {hasSelection && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-t border-stone-100 bg-stone-50/50 overflow-x-auto">
          {/* 文字属性 */}
          {selectedType === "text" && (
            <>
              {/* 字体选择 */}
              <select
                value={currentFont}
                onChange={(e) => onFontChange?.(e.target.value)}
                className="text-xs border border-stone-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {FONTS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>

              {/* 字号 */}
              <select
                value={currentFontSize}
                onChange={(e) => onFontSizeChange?.(Number(e.target.value))}
                className="text-xs border border-stone-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {FONT_SIZES.map((s) => (
                  <option key={s} value={s}>{s}px</option>
                ))}
              </select>

              {/* 颜色选择 */}
              <div className="flex items-center gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onColorChange?.(c)}
                    className={cn(
                      "size-5 rounded-full border-2 transition-all",
                      currentColor === c ? "border-amber-500 scale-110" : "border-stone-200 hover:scale-105"
                    )}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </>
          )}

          {/* 图片滤镜 */}
          {selectedType === "image" && currentFilter && (
            <div className="flex items-center gap-3">
              <Palette className="size-4 text-stone-500" />
              {[
                { key: "brightness" as const, label: "亮度", icon: Sun, min: 0, max: 200 },
                { key: "contrast" as const, label: "对比度", icon: Contrast, min: 0, max: 200 },
                { key: "saturation" as const, label: "饱和度", icon: Droplets, min: 0, max: 200 },
              ].map(({ key, label, icon: Icon, min, max }) => (
                <div key={key} className="flex items-center gap-1">
                  <Icon className="size-3 text-stone-400" />
                  <span className="text-xs text-stone-500 w-8">{label}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={currentFilter[key]}
                    onChange={(e) =>
                      onFilterChange?.({ ...currentFilter, [key]: Number(e.target.value) })
                    }
                    className="w-16 h-1 accent-amber-500"
                  />
                  <span className="text-xs text-stone-400 w-7">{currentFilter[key]}</span>
                </div>
              ))}
              <button
                onClick={() => onFilterChange?.(defaultFilter)}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium"
              >
                重置
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
