"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { useBookStore } from "@/stores/bookStore";
import { useEditorStore } from "@/stores/editorStore";
import { ToolBar } from "@/components/ToolBar";
import { PageThumbnails } from "@/components/PageThumbnails";
import { CanvasEditor } from "@/components/CanvasEditor";
import { DoodleCanvas } from "@/components/DoodleCanvas";
import { generateId } from "@/lib/utils";
import type {
  PageElement,
  PageElementType,
  TextElementData,
  ImageElementData,
  DoodleElementData,
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

  // 订阅书信息
  const book = useBookStore((s) => s.books.find((b) => b.id === bookId));
  const updateBook = useBookStore((s) => s.updateBook);

  // 订阅编辑器状态（使用选择器确保响应式）
  const pages = useEditorStore((s) => s.pages);
  const currentPage = useEditorStore((s) => s.currentPage);
  const selectedElements = useEditorStore((s) => s.selectedElements);
  const undoStackLen = useEditorStore((s) => s.undoStack.length);
  const redoStackLen = useEditorStore((s) => s.redoStack.length);
  const addPage = useEditorStore((s) => s.addPage);
  const removePage = useEditorStore((s) => s.removePage);
  const setCurrentPage = useEditorStore((s) => s.setCurrentPage);
  const addElement = useEditorStore((s) => s.addElement);
  const updateElement = useEditorStore((s) => s.updateElement);
  const removeElement = useEditorStore((s) => s.removeElement);
  const selectElement = useEditorStore((s) => s.selectElement);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const pushUndo = useEditorStore((s) => s.pushUndo);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const resetEditor = useEditorStore((s) => s.resetEditor);

  const [showDoodle, setShowDoodle] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 进入编辑页时重置编辑器状态（防止切换书籍时状态残留）
  useEffect(() => {
    resetEditor();
  }, [bookId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 筛选本书的页面，按 pageNumber 排序
  const bookPages = useMemo(
    () => pages.filter((p) => p.bookId === bookId).sort((a, b) => a.pageNumber - b.pageNumber),
    [pages, bookId]
  );

  // 当前页数据：使用 currentPage 作为 bookPages 的索引（现在 pageNumber 即书内索引）
  const currentPageData = bookPages[currentPage] ?? bookPages[0];

  // 确保至少有一页
  useEffect(() => {
    if (bookPages.length === 0 && book) {
      addPage(bookId);
    }
  }, [bookId, bookPages.length, addPage, book]);

  // 书不存在时跳回首页
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

  /** 获取当前正在操作的 pageNumber */
  const activePageNumber = currentPageData?.pageNumber ?? currentPage;

  /** 创建快照（用于撤销） */
  const takeSnapshot = () => {
    if (currentPageData) {
      pushUndo({ elements: [...currentPageData.content.elements] });
    }
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 在输入框中不触发快捷键
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElements.length > 0 && currentPageData) {
          e.preventDefault();
          takeSnapshot();
          selectedElements.forEach((id) => removeElement(activePageNumber, id));
          clearSelection();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // takeSnapshot is re-created each render and captured by closure
  }, [selectedElements, currentPageData, undo, redo, activePageNumber, removeElement, clearSelection]); // eslint-disable-line react-hooks/exhaustive-deps

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
    addElement(activePageNumber, element);
  };

  /** 图片上传处理（带大小限制和压缩） */
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 文件大小限制 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("图片大小不能超过 5MB，请压缩后再上传。");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // localStorage 空间检查（预留至少 500KB 余量）
    const used = new Blob(Object.values(localStorage)).size;
    const available = 5 * 1024 * 1024; // 大多数浏览器限制 ~5MB
    if (used > available - 512 * 1024) {
      alert("存储空间不足，请清理一些旧书籍或页面后再上传。");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!currentPageData) {
      addPage(bookId);
      // 等待页面创建完成后再添加图片
      setTimeout(() => {
        const st = useEditorStore.getState();
        const bp = st.pages.filter((p) => p.bookId === bookId);
        const lastPage = bp[bp.length - 1];
        if (lastPage) addImageToPage(lastPage.pageNumber, file);
      }, 100);
      return;
    }
    takeSnapshot();
    addImageToPage(activePageNumber, file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** 将图片文件转为元素（自动压缩大图） */
  const addImageToPage = (pageNum: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;

      // 大于 1MB 的图片用 Canvas 压缩
      if (dataUrl.length > 1 * 1024 * 1024) {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 800;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width *= ratio;
            height *= ratio;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", 0.7);
            addImageElement(pageNum, compressed);
          }
        };
        img.src = dataUrl;
      } else {
        addImageElement(pageNum, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  /** 创建图片元素 */
  const addImageElement = (pageNum: number, src: string) => {
    const element: PageElement = {
      id: generateId(),
      type: "image",
      x: 80,
      y: 80,
      width: 350,
      height: 250,
      data: {
        src,
        filter: { brightness: 100, contrast: 100, saturation: 100 },
      } as ImageElementData,
    };
    addElement(pageNum, element);
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
    addElement(activePageNumber, element);
  };

  /** 更新元素 */
  const handleUpdateElement = (elementId: string, changes: Partial<PageElement>) => {
    if (currentPageData == null) return;
    updateElement(activePageNumber, elementId, changes);
  };

  /** 删除选中元素 */
  const handleDeleteSelected = () => {
    if (!currentPageData) return;
    takeSnapshot();
    selectedElements.forEach((id) => removeElement(activePageNumber, id));
    clearSelection();
  };

  /** 选中元素信息 */
  const selectedEl = currentPageData?.content.elements.find(
    (el) => selectedElements.includes(el.id)
  );
  const selectedType = selectedEl?.type;
  const selectedTextData =
    selectedType === "text" ? (selectedEl?.data as TextElementData) : undefined;
  const selectedImageData =
    selectedType === "image" ? (selectedEl?.data as ImageElementData) : undefined;

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
        <h1 className="text-sm font-bold text-stone-800 truncate max-w-xs">
          {book.title}
        </h1>
        <span className="text-xs text-stone-400">{bookPages.length} 页</span>
        <div className="flex-1" />
        <button
          onClick={handleExportPage}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Download className="size-3.5" />
          导出 PNG
        </button>
      </div>

      {/* 工具栏（现在 canUndo/canRedo 是响应式的） */}
      <ToolBar
        onAddElement={handleAddElement}
        onUndo={undo}
        onRedo={redo}
        onDeleteSelected={handleDeleteSelected}
        canUndo={undoStackLen > 0}
        canRedo={redoStackLen > 0}
        hasSelection={selectedElements.length > 0}
        selectedType={selectedType}
        currentFont={selectedTextData?.font}
        currentFontSize={selectedTextData?.size}
        currentColor={selectedTextData?.color}
        onFontChange={(font) =>
          selectedEl &&
          handleUpdateElement(selectedEl.id, {
            data: { ...selectedEl.data, font },
          } as Partial<PageElement>)
        }
        onFontSizeChange={(size) =>
          selectedEl &&
          handleUpdateElement(selectedEl.id, {
            data: { ...selectedEl.data, size },
          } as Partial<PageElement>)
        }
        onColorChange={(color) =>
          selectedEl &&
          handleUpdateElement(selectedEl.id, {
            data: { ...selectedEl.data, color },
          } as Partial<PageElement>)
        }
        currentFilter={selectedImageData?.filter}
        onFilterChange={(filter) =>
          selectedEl &&
          handleUpdateElement(selectedEl.id, {
            data: { ...selectedEl.data, filter },
          } as Partial<PageElement>)
        }
        currentStyle={book.style}
        onStyleChange={(style) => updateBook(bookId, { style })}
      />

      {/* 主编辑区 */}
      <div className="flex-1 flex overflow-hidden">
        <PageThumbnails
          pages={bookPages}
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          onAddPage={() => addPage(bookId)}
          onDeletePage={removePage}
        />

        {currentPageData && (
          <CanvasEditor
            key={`${bookId}-${currentPage}`}
            page={currentPageData}
            selectedElements={selectedElements}
            onSelectElement={selectElement}
            onClearSelection={clearSelection}
            onUpdateElement={handleUpdateElement}
            onRemoveElement={(id) => removeElement(activePageNumber, id)}
            onAddElement={(el) => addElement(activePageNumber, el)}
            styleClass={styleClass}
          />
        )}

        {/* 隐藏的图片上传 input — 唯一入口 */}
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
