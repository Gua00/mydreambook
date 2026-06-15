"use client";

import { useState, useMemo } from "react";
import { celebrityStories, industries } from "@/data/celebrities";
import type { CelebrityStory } from "@/data/celebrities";
import { cn } from "@/lib/utils";
import { Quote, ExternalLink, Sparkles, Search, X } from "lucide-react";

/** 单张名人卡片 */
function CelebrityCard({ story }: { story: CelebrityStory }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl book-shadow overflow-hidden animate-fade-in hover:shadow-md transition-shadow">
      {/* 头部 */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl shrink-0">{story.emoji}</span>
          <div className="min-w-0">
            <h3 className="font-bold text-stone-800 dark:text-stone-100">{story.name}</h3>
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">{story.title}</p>
            <span className="inline-block mt-1 text-xs bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-full">
              {story.industry}
            </span>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="px-5 pb-3">
        <p className={cn(
          "text-sm text-stone-600 dark:text-stone-400 leading-relaxed",
          !expanded && "line-clamp-3"
        )}>
          {story.content}
        </p>
        {story.content.length > 120 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline mt-1"
          >
            {expanded ? "收起" : "展开全文"}
          </button>
        )}
      </div>

      {/* 引用 */}
      <div className="mx-5 mb-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border-l-2 border-amber-400">
        <Quote className="size-3 text-amber-400 mb-1" />
        <p className="text-sm italic text-stone-700 dark:text-stone-300">"{story.quote}"</p>
      </div>

      {/* 来源 */}
      <div className="px-5 pb-4 flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
        <ExternalLink className="size-3" />
        <span>来源：{story.source}</span>
      </div>
    </div>
  );
}

/** 名人堂页面 */
export default function CelebritiesPage() {
  const [activeIndustry, setActiveIndustry] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  /** 按行业和搜索词过滤 */
  const filtered = useMemo(() => {
    let result = celebrityStories;
    if (activeIndustry !== "all") {
      result = result.filter((s) => s.industry === activeIndustry);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.content.toLowerCase().includes(q) ||
          s.industry.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeIndustry, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
          <Sparkles className="size-6 text-amber-500" />
          名人堂
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          看看那些实现了梦想的人，他们是如何从零开始的
        </p>
      </div>

      {/* 搜索框 */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索名人、行业..."
          className="w-full pl-9 pr-8 py-2.5 text-sm border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-stone-400 hover:text-stone-600"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* 行业筛选 */}
      <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-2">
        {industries.map((ind) => (
          <button
            key={ind.key}
            onClick={() => setActiveIndustry(ind.key)}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              activeIndustry === ind.key
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 shadow-sm"
                : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            )}
          >
            <span>{ind.emoji}</span>
            {ind.label}
          </button>
        ))}
      </div>

      {/* 卡片网格 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((story) => (
            <CelebrityCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-stone-400">
          <Search className="size-12 mb-3 opacity-30" />
          <p className="text-sm">没有找到匹配的名人故事</p>
        </div>
      )}
    </div>
  );
}
