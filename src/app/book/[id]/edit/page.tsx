"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useCallback, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { useBookStore } from "@/stores/bookStore";
import { useEditorStore } from "@/stores/editorStore";
import { useUIStore } from "@/stores/uiStore";
import { ToolBar } from "@/components/ToolBar";
import { PageThumbnails } from "@/components/PageThumbnails";
import { CanvasEditor } from "@/components/CanvasEditor";
import { DoodleCanvas } from "@/components/DoodleCanvas";
import { generateId, now, cn } from "@/lib/utils";
import type {
  PageElement,
  PageElementType,
  TextElementData,
  ImageElementData,
  DoodleElementData,
  ImageFilter,
} from "@/types";

/** 风格 CSS 类映射 */
const styleClassMap: Record<string, string> = {
  vintage: "theme-vintage",
  starry: "theme-starry",
  light: "theme-light",
  dark: "theme-dark",
};

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const book = useBookStore((s) => s.books.find((b) => b.id === bookId));
  const updateBook = useBookStore((s) => s.updateBook);
  const {
    pages, currentPage, selectedElements,
    addPage, removePage, setCurrentPage,
    addElement, updateElement, removeElement,
    selectElement, clearSelection,
    pushUndo, undo, redo,
  } = useEditorStore();

  const [showDoodle, setShowDoodle] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 书籍的页面列表
  const bookPages = pages.filter((p) => p.bookId === bookId);
  const currentPageData = bookPages[currentPage];

  // 确保至少有一页
  useEffect(() => {
    if (bookPages.length === 0) {
      addPage(bookId);
    }
  }, [bookId, bookPages.length, addPage]);

  // 如果书不存在，跳回首页
  useEffect(() => {
    if (!book && useBookStore.getState().books.length > 0) {
      router.push("/");
    }
  }, [book, router]);

  if (!book) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-stone-500">加载中...</p>
      </div>
    );
  }

  const styleClass = styleClassMap[book.style] || "theme-light";
  const bookPageCount = bookPages.length;

  /** 创建快照（用于撤销） */
  const takeSnapshot = () => {
    if (currentPageData) {
      pushUndo({ elements: [...currentPageData.content.elements] });
    }
  };

  /** 添加新元素 */
  const handleAddElement = (type: PageElementType) => {
    if (!currentPageData) return;
    takeSnapshot();

    if (type === "image") {
      fileInputRef.current?.click();
      return;
    }

    if (type === "doodle") {
      setShowDoodle(true);
      return;
    }

    // 添加文字元素
    const element: PageElement = {
      id: generateId(),
      type: "text",
      x: 100,
      y: 100,
      width: 400,
      height: 60,
      data: {
        content: "双击编辑文字 ✨",
        font: "KaiTi, STKaiti, serif",
        size: 24,
        color: "#4a3728",
      } as TextElementData,
    };
    addElement(currentPage, element);
  };

  /** 图片上传处理 */
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentPageData) return;
    takeSnapshot();

    const reader = new FileReader();
    reader.onload = (ev) => {
      const element: PageElement = {
        id: generateId(),
        type: "image",
        x: 80,
        y: 80,
        width: 350,
        height: 250,
        data: { src: ev.target?.result as string, filter: { brightness: 100, contrast: 100, saturation: 100 } } as ImageElementData,
      };
      addElement(currentPage, element);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** 涂鸦保存 */
  const handleDoodleSave = (svgPath: string, strokeColor: string, strokeWidth: number) => {
    if (currentPageData == null) return;
    takeSnapshot();
    const element: PageElement = {
      id: generateId(),
      type: "doodle",
      x: 50,
      y: 50,
      width: 400,
      height: 300,
      data: { svgPath, strokeColor, strokeWidth } as DoodleElementData,
    };
    addElement(currentPage, element);
  };

  /** 更新元素（带快照） */
  const handleUpdateElement = (elementId: string, changes: Partial<PageElement>) => {
    if (currentPageData == null) return;
    updateElement(currentPage, elementId, changes);
  };

  /** 删除选中元素 */
  const handleDeleteSelected = () => {
    if (!currentPageData) return;
    takeSnapshot();
    selectedElements.forEach((id) => removeElement(currentPage, id));
    clearSelection();
  };

  /** 导出当前页为 PNG */
  const handleExportPage = async () => {
    try {
      const { toPng } = await import("html-to-image");
      const el = document.querySelector("[data-canvas]") as HTMLElement;
      if (!el) return;
      const dataUrl = await toPng(el, { quality: 0.95 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${book.title}_第${currentPage + 1}页.png`;
      a.click();
    } catch {
      alert("导出失败，请重试");
    }
  };

  // 选中元素信息
  const selectedEl = currentPageData?.content.elements.find(
    (el) => selectedElements.includes(el.id)
  );
  const selectedType = selectedEl?.type;
  const selectedTextData = selectedType === "text" ? (selectedEl?.data as TextElementData) : undefined;
  const selectedImageData = selectedType === "image" ? (selectedEl?.data as ImageElementData) : undefined;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* 顶部栏：书名 + 返回 */}
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
        <div className="flex-1" />
        <button
          onClick={handleExportPage}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Download className="size-3.5" />
          导出 PNG
        </button>
      </div>

      {/* 工具栏 */}
      <ToolBar
        onAddElement={handleAddElement}
        onUndo={undo}
        onRedo={redo}
        onDeleteSelected={handleDeleteSelected}
        canUndo={useEditorStore.getState().undoStack.length > 0}
        canRedo={useEditorStore.getState().redoStack.length > 0}
        hasSelection={selectedElements.length > 0}
        selectedType={selectedType}
        currentFont={selectedTextData?.font}
        currentFontSize={selectedTextData?.size}
        currentColor={selectedTextData?.color}
        onFontChange={(font) => selectedEl && handleUpdateElement(selectedEl.id, { data: { ...selectedEl.data, font } as TextElementData })}
        onFontSizeChange={(size) => selectedEl && handleUpdateElement(selectedEl.id, { data: { ...selectedEl.data, size } as TextElementData })}
        onColorChange={(color) => selectedEl && handleUpdateElement(selectedEl.id, { data: { ...selectedEl.data, color } as TextElementData })}
        currentFilter={selectedImageData?.filter}
        onFilterChange={(filter) => selectedEl && handleUpdateElement(selectedEl.id, { data: { ...selectedEl.data, filter } as ImageElementData })}
        currentStyle={book.style}
        onStyleChange={(style) => updateBook(bookId, { style })}
      />

      {/* 主编辑区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧缩略图 */}
        <PageThumbnails
          pages={bookPages}
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          onAddPage={() => addPage(bookId)}
          onDeletePage={removePage}
        />

        {/* 画布 */}
        {currentPageData && (
          <CanvasEditor
            page={currentPageData}
            selectedElements={selectedElements}
            onSelectElement={selectElement}
            onClearSelection={clearSelection}
            onUpdateElement={handleUpdateElement}
            onRemoveElement={(id) => removeElement(currentPage, id)}
            onAddElement={(el) => addElement(currentPage, el)}
            styleClass={styleClass}
          />
        )}

        {/* 隐藏的图片上传 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFile}
          className="hidden"
        />
      </div>

      {/* 涂鸦弹窗 */}
      <DoodleCanvas
        open={showDoodle}
        onClose={() => setShowDoodle(false)}
        onSave={handleDoodleSave}
      />
    </div>
  );
}
