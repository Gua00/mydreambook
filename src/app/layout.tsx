import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppBody } from "./AppBody";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "梦想之书 — 记录你的每一个梦想",
  description: "一款帮助记录和实现梦想的网页应用，以书籍形式呈现梦想内容，支持自由画布编辑、3D翻页和社交展示。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/*
        ⚠️ 不在 <html> 上加 suppressHydrationWarning
        主题通过内联 style 处理，不依赖 CSS 类加载时序
      */}
      <body
        className="min-h-full flex flex-col"
        /*
          内联默认值（亮色），阻塞脚本会立即覆写
          这保证即使 CSS 未加载也不会有颜色闪烁
        */
        style={{ background: "#fffbeb", color: "#292524" }}
      >
        {/*
          同步阻塞脚本：在浏览器绘制任何像素前执行
          用内联 style 设置颜色，不依赖 Tailwind CSS 是否已加载
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var bg, fg;
                try {
                  var raw = localStorage.getItem('mydreambook-ui');
                  if (raw) {
                    var theme = JSON.parse(raw).state && JSON.parse(raw).state.theme;
                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                      bg = '#1c1917'; fg = '#e7e5e4';
                    } else {
                      document.documentElement.classList.remove('dark');
                      bg = '#fffbeb'; fg = '#292524';
                    }
                  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                    bg = '#1c1917'; fg = '#e7e5e4';
                  }
                } catch(e) {}

                // 用内联 style 立即设置，不依赖 CSS 文件
                if (bg) {
                  document.body.style.backgroundColor = bg;
                  document.body.style.color = fg;
                }
              })();
            `,
          }}
        />
        <AppBody>{children}</AppBody>
      </body>
    </html>
  );
}
