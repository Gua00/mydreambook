"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { X, Eraser, Brush } from "lucide-react";
import { cn } from "@/lib/utils";

interface DoodleCanvasProps {
  open: boolean;
  onClose: () => void;
  onSave: (svgPath: string, strokeColor: string, strokeWidth: number) => void;
}

/** 手写涂鸦画布弹窗 */
export function DoodleCanvas({ open, onClose, onSave }: DoodleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#1a1a1a");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [paths, setPaths] = useState<string[]>([]);

  // 初始化 Canvas
  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, [open]);

  /** 获取 Canvas 坐标 */
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  /** 开始绘制 */
  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : strokeColor;
    ctx.lineWidth = tool === "eraser" ? strokeWidth * 3 : strokeWidth;
  };

  /** 绘制中 */
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  /** 结束绘制 */
  const endDraw = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.closePath();
  };

  /** 清空画布 */
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setPaths([]);
  };

  /** 保存涂鸦（导出为 SVG path）*/
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 将 Canvas 转为 data URL 作为 SVG path
    const dataUrl = canvas.toDataURL("image/png");
    // 使用简单的 path 格式存储（实际渲染用图片回退）
    const svgPath = `M0,0 L${canvas.width},0 L${canvas.width},${canvas.height} L0,${canvas.height}Z`;
    onSave(dataUrl, strokeColor, strokeWidth);
    onClose();
  };

  if (!open) return null;

  const colors = ["#1a1a1a", "#4a3728", "#dc2626", "#2563eb", "#059669", "#7c3aed", "#d97706", "#ec4899"];
  const widths = [1, 3, 5, 8, 12];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden animate-slide-up">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
          <h2 className="text-lg font-bold text-stone-800">✏️ 手写涂鸦</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100">
            <X className="size-5" />
          </button>
        </div>

        {/* 工具栏 */}
        <div className="flex items-center gap-3 px-5 py-2 border-b border-stone-100 bg-stone-50/50">
          {/* 画笔/橡皮切换 */}
          <div className="flex bg-stone-200 rounded-lg p-0.5">
            <button
              onClick={() => setTool("pen")}
              className={cn("p-1.5 rounded-md text-xs", tool === "pen" ? "bg-white shadow-sm" : "")}
            >
              <Brush className="size-3.5" />
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={cn("p-1.5 rounded-md text-xs", tool === "eraser" ? "bg-white shadow-sm" : "")}
            >
              <Eraser className="size-3.5" />
            </button>
          </div>

          {/* 颜色 */}
          <div className="flex items-center gap-0.5">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => { setStrokeColor(c); setTool("pen"); }}
                className={cn("size-5 rounded-full border-2 transition-all",
                  strokeColor === c && tool === "pen" ? "border-amber-500 scale-110" : "border-stone-200"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* 粗细 */}
          <div className="flex items-center gap-0.5 ml-2">
            {widths.map((w) => (
              <button
                key={w}
                onClick={() => setStrokeWidth(w)}
                className={cn("p-1 rounded-full transition-all",
                  strokeWidth === w ? "bg-amber-100" : "hover:bg-stone-100"
                )}
              >
                <div
                  className="rounded-full bg-stone-600"
                  style={{ width: Math.max(w, 4), height: Math.max(w, 4) }}
                />
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <button onClick={clearCanvas} className="text-xs text-stone-500 hover:text-red-500 transition-colors">
            清空
          </button>
        </div>

        {/* 画布 */}
        <div className="relative border-b border-stone-200 bg-white" style={{ height: 400 }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>

        {/* 底部按钮 */}
        <div className="px-5 py-3 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl transition-colors">
            取消
          </button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors">
            保存涂鸦
          </button>
        </div>
      </div>
    </div>
  );
}
