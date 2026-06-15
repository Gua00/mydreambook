"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, Download, Upload, Menu, X, Sun, Moon, Star, User, Settings, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useBookStore } from "@/stores/bookStore";
import { useEditorStore } from "@/stores/editorStore";
import { useExploreStore } from "@/stores/exploreStore";
import { useUIStore } from "@/stores/uiStore";
import { useUserStore } from "@/stores/userStore";
import { cn } from "@/lib/utils";

/** 顶部导航栏 — 书架、公开墙、名人堂、数据备份、主题切换 */
export function NavBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const userProfile = useUserStore((s) => s.profile);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const setProfile = useUserStore((s) => s.setProfile);
  const logout = useUserStore((s) => s.logout);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editBio, setEditBio] = useState("");

  // 主题变化时同步 DOM class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const links = [
    { href: "/", label: "我的书架", icon: BookOpen },
    { href: "/explore", label: "公开墙", icon: Compass },
    { href: "/celebrities", label: "名人堂", icon: Star },
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
          {/* 主题切换 */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title={theme === "dark" ? "切换浅色模式" : "切换深色模式"}
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>

          {/* 导出按钮 */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="导出 JSON 备份"
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">备份</span>
          </button>

          {/* 导入按钮 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
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

          {/* 用户头像 / 登录入口 */}
          <div className="relative">
            <button
              onClick={() => {
                if (isLoggedIn) {
                  setShowUserMenu(!showUserMenu);
                } else {
                  setEditNickname("");
                  setEditBio("");
                  setShowProfileEdit(true);
                }
              }}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors",
                isLoggedIn
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                  : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              )}
              title={isLoggedIn ? userProfile?.nickname : "设置昵称"}
            >
              <span className="text-lg">{isLoggedIn ? userProfile?.avatar : <User className="size-4" />}</span>
              <span className="hidden sm:inline text-xs max-w-[60px] truncate">
                {isLoggedIn ? userProfile?.nickname : "登录"}
              </span>
            </button>

            {/* 用户下拉菜单 */}
            {showUserMenu && isLoggedIn && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-stone-800 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{userProfile?.avatar}</span>
                      <div>
                        <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{userProfile?.nickname}</p>
                        <p className="text-xs text-stone-400">{userProfile?.bio || '这个梦想家很懒，什么都没写'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setEditNickname(userProfile?.nickname || "");
                        setEditBio(userProfile?.bio || "");
                        setShowProfileEdit(true);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                    >
                      <Settings className="size-3.5" />
                      编辑资料
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    >
                      <LogOut className="size-3.5" />
                      退出登录
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {menuOpen && (
        <div className="sm:hidden border-t border-stone-100 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-2 flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                pathname === href
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                  : "text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </div>
      )}

      {/* 资料编辑弹窗 */}
      {showProfileEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-700">
              <h2 className="text-lg font-bold text-stone-800 dark:text-stone-200">
                {isLoggedIn ? '编辑资料' : '👋 设置你的昵称'}
              </h2>
              <button
                onClick={() => setShowProfileEdit(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* 头像选择 */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">选择头像</label>
                <div className="flex flex-wrap gap-2">
                  {['🌟', '🚀', '🎨', '📚', '🌙', '✨', '🎵', '🌈', '🔥', '💎', '🦋', '🌻', '🎯', '🏆', '💡'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setProfile({ avatar: emoji })}
                      className={cn(
                        "text-xl p-1.5 rounded-lg transition-all hover:scale-110",
                        userProfile?.avatar === emoji ? "bg-amber-100 dark:bg-amber-900 ring-2 ring-amber-400" : ""
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              {/* 昵称 */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">昵称</label>
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  placeholder="你的昵称"
                  className="w-full px-3 py-2.5 border border-stone-200 dark:border-stone-600 rounded-xl text-sm bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                  autoFocus
                />
              </div>
              {/* 简介 */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">一句话介绍</label>
                <input
                  type="text"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="介绍一下自己..."
                  className="w-full px-3 py-2.5 border border-stone-200 dark:border-stone-600 rounded-xl text-sm bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-stone-100 dark:border-stone-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowProfileEdit(false)}
                className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setProfile({ nickname: editNickname || '梦想家', bio: editBio });
                  setShowProfileEdit(false);
                }}
                className="px-5 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
