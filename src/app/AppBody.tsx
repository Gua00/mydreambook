"use client";

import { useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { useUIStore } from "@/stores/uiStore";

/**
 * 客户端 Body 包装组件：
 * - 渲染 NavBar 和页面内容
 * - 监听主题变化，同步 html 的 dark class 和 body 内联 style
 * - 不用 useEffect 做初始化，避免额外的渲染周期
 */
export function AppBody({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme);

  // 主题变化时同步（切换主题时触发，非初始加载）
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
      document.body.style.backgroundColor = "#1c1917";
      document.body.style.color = "#e7e5e4";
    } else {
      html.classList.remove("dark");
      document.body.style.backgroundColor = "#fffbeb";
      document.body.style.color = "#292524";
    }
  }, [theme]);

  return (
    <>
      <NavBar />
      <main className="flex-1 flex flex-col">{children}</main>
    </>
  );
}
