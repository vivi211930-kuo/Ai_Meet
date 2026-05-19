/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Copy, Check, Loader2, FileText, MoveRight } from "lucide-react";
import { cn } from "./lib/utils";

export default function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.ok) {
        throw new Error("伺服器發生錯誤或 API 金鑰未設定");
      }

      const data = await res.json();
      setResult(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "發生未知錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("無法複製文字", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6 border border-slate-200/50">
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4 font-serif">
            AI 會議記錄與翻譯工具
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-light">
            自動將您的繁雜逐字稿、會議筆記轉化為結構清晰、重點明確的會議記錄，並提供精準的多國語言總結。
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input Area */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 overflow-hidden flex flex-col h-[600px] transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <span>輸入會議內容</span>
                </div>
                <span className="text-xs tracking-wider text-slate-400 uppercase font-semibold">Input</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此貼上您的會議逐字稿、討論筆記或是需要翻譯的文字內容..."
                className="flex-1 w-full bg-slate-50/50 rounded-2xl p-4 text-slate-700 border border-transparent focus:border-indigo-500/30 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 resize-none outline-none transition-all placeholder:text-slate-400 text-[15px] leading-relaxed"
              ></textarea>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-slate-400">字數統計：{input.length} 字</p>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-medium transition-all hover:bg-indigo-700 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-indigo-500/30",
                    (isLoading || !input.trim()) && "opacity-60 cursor-not-allowed hover:bg-indigo-600 active:scale-100"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>正在分析與生成...</span>
                    </>
                  ) : (
                    <>
                      <span>生成總結與翻譯</span>
                      <MoveRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Area */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 flex flex-col h-[600px] relative transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>AI 生成結果</span>
                </div>
                {result && (
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">已複製</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>一鍵複製</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {error ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center h-full">
                    <p className="font-medium mb-1">生成功未完成</p>
                    <p className="text-sm opacity-80">{error}</p>
                  </div>
                ) : !result && !isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                      <Sparkles className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm">生成的會議記錄將顯示於此</p>
                  </div>
                ) : isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-indigo-500 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p className="text-sm font-medium animate-pulse">正在為您處理會議記錄...</p>
                  </div>
                ) : (
                  <div className="prose prose-slate prose-sm md:prose-base prose-headings:font-serif prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:leading-relaxed prose-a:text-indigo-600 max-w-none pb-4">
                    <Markdown remarkPlugins={[remarkGfm]}>{result}</Markdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
