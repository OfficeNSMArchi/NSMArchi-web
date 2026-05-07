"use client";

import { useState } from "react";

interface ExistingProject {
  id: string;
  title: string;
  titleKo: string;
}

interface Props {
  mdx: string;
  projectId: string;
  errors?: string[];
  existingProjects?: ExistingProject[];
  projectsLoaded?: boolean;
  onLoadProject?: (id: string) => void;
}

export default function MdxPreview({ mdx, projectId, errors = [], existingProjects = [], projectsLoaded = false, onLoadProject }: Props) {
  const [tab, setTab] = useState<"list" | "mdx">("list");
  const [copied, setCopied] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  function handleCopy() {
    navigator.clipboard.writeText(mdx).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const hasErrors = errors.length > 0;

  return (
    <div className="flex flex-col h-full">

      {/* 탭 */}
      <div className="flex border-b border-gray-200 mb-3 shrink-0">
        <button
          type="button"
          onClick={() => setTab("list")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "list" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          기존 프로젝트
          {existingProjects.length > 0 && (
            <span className="ml-1.5 text-xs text-gray-400">{existingProjects.length}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("mdx")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "mdx" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          MDX
          {hasErrors && <span className="ml-1.5 text-xs text-red-500">!</span>}
        </button>
      </div>

      {/* 기존 프로젝트 탭 */}
      {tab === "list" && (
        <div className="flex-1 overflow-y-auto space-y-1">
          {!projectsLoaded ? (
            <p className="text-xs text-gray-400 text-center py-8">불러오는 중...</p>
          ) : existingProjects.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">프로젝트가 없습니다</p>
          ) : (
            existingProjects.map((p) => (
              <div key={p.id} className="relative px-3 py-2 rounded-lg hover:bg-gray-50 group flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-gray-300 font-mono">{p.id}</p>
                  <p className="text-sm text-gray-800">{p.title}</p>
                  {p.titleKo && <p className="text-xs text-gray-500">{p.titleKo}</p>}
                </div>
                <div className="relative shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-gray-200 text-gray-500 transition-opacity"
                  >
                    ⋯
                  </button>
                  {openMenu === p.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-36">
                      <button
                        type="button"
                        onClick={() => { onLoadProject?.(p.id); setOpenMenu(null); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 rounded-lg"
                      >
                        폼에 불러오기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MDX 탭 */}
      {tab === "mdx" && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <span className="text-xs text-gray-500">MDX 미리보기</span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied ? "✓ 복사됨" : "복사"}
            </button>
          </div>

          {hasErrors && (
            <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg shrink-0">
              <p className="text-xs font-medium text-red-700 mb-1">필수 항목을 입력해주세요</p>
              <ul className="text-xs text-red-600 space-y-0.5">
                {errors.map((e) => <li key={e}>· {e}</li>)}
              </ul>
            </div>
          )}

          <textarea
            readOnly
            value={mdx}
            className="flex-1 w-full font-mono text-xs border border-gray-200 rounded-lg p-3 bg-gray-50 resize-none focus:outline-none"
            spellCheck={false}
          />
          <p className="mt-2 text-xs text-gray-400 shrink-0">
            이 파일을 <code className="bg-gray-100 px-1 rounded">public/projects/{projectId || "{id}"}/</code> 폴더에 넣으세요.
          </p>
        </div>
      )}

    </div>
  );
}
