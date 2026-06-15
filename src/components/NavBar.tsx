"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, Download, Upload, Menu, X } from "lucide-react";
import { useState, useRef } from "react";
import { useBookStore } from "@/stores/bookStore";
import { useEditorStore } from "@/stores/editorStore";
import { useExploreStore } from "@/stores/exploreStore";
import { cn } from "@/lib/utils";

/** 顶部导航栏 — 书架、公开墙、数据备份 */
export function NavBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const links = [
    { href: "/", label: "我的书架", icon: BookOpen },
    { href: "/explore", label: "公开墙", icon: Compass },
  ];

  /** 导出全部数据为 JSON */
  const handleExport = () => {
    const books = useBookStore.getState().books;
    const pages = useEditorStore.getState().pages;
    const interactions = useExploreStore.getState().interactions;

    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      books,
      pages,
      interactions,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `梦想之书_备份_${new Date().toLocaleDateString("zh-CN").replace(/\//g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** 导入 JSON 备份 */
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.books)
          useBookStore.setState({ books: data.books });
        if (data.pages)
          useEditorStore.setState({ pages: data.pages, currentPage: 0 });
        if (data.interactions)
          useExploreStore.setState({ interactions: data.interactions });
        alert("✅ 数据恢复成功！");
      } catch {
        alert("❌ 文件格式错误，请检查备份文件。");
      }
    };
    reader.readAsText(file);
    // 重置 input 以便重复导入同一文件
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-stone-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 左侧 Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-amber-700 hover:text-amber-800 transition-colors"
        >
          <BookOpen className="size-5" />
          <span className="hidden sm:inline">梦想之书</span>
        </Link>

        {/* 中间导航链接 */}
        <div className="hidden sm:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-amber-100 text-amber-800"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-800"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </div>

        {/* 右侧操作 */}
        <div className="flex items-center gap-1">
          {/* 导出按钮 */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors"
            title="导出 JSON 备份"
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">备份</span>
          </button>

          {/* 导入按钮 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-800 transition-colors"
            title="导入 JSON 备份"
          >
            <Upload className="size-4" />
            <span className="hidden sm:inline">恢复</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {menuOpen && (
        <div className="sm:hidden border-t border-stone-100 bg-white px-4 py-2 flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                pathname === href
                  ? "bg-amber-100 text-amber-800"
                  : "text-stone-600 hover:bg-stone-50"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
