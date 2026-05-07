"use client";

import { ContentBlock } from "@/lib/generateMdx";

interface Props {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  images?: string[];
}

export default function ContentBlockEditor({ blocks, onChange, images = [] }: Props) {
  function add(type: "image" | "text") {
    const block: ContentBlock =
      type === "image"
        ? { type: "image", src: "", alt: "" }
        : { type: "text", titleKo: "", titleEn: "", bodyKo: "", bodyEn: "" };
    onChange([...blocks, block]);
  }

  function remove(i: number) {
    onChange(blocks.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const next = [...blocks];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function update(i: number, patch: Partial<ContentBlock>) {
    onChange(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {block.type === "image" ? "🖼 이미지 블록" : "📝 텍스트 블록"} #{i + 1}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === blocks.length - 1}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50"
              >
                ×
              </button>
            </div>
          </div>

          {block.type === "image" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">파일명 / URL</label>
                {images.length > 0 ? (
                  <select
                    value={block.src || ""}
                    onChange={(e) => update(i, { src: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                  >
                    <option value="">— 선택 —</option>
                    {images.map((img) => (
                      <option key={img} value={img}>{img}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={block.src || ""}
                    onChange={(e) => update(i, { src: e.target.value })}
                    placeholder="01-exterior.png"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Alt 텍스트</label>
                <input
                  type="text"
                  value={block.alt || ""}
                  onChange={(e) => update(i, { alt: e.target.value })}
                  placeholder="Exterior view"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">제목 (한국어)</label>
                  <input
                    type="text"
                    value={block.titleKo || ""}
                    onChange={(e) => update(i, { titleKo: e.target.value })}
                    placeholder="개요"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">제목 (영어)</label>
                  <input
                    type="text"
                    value={block.titleEn || ""}
                    onChange={(e) => update(i, { titleEn: e.target.value })}
                    placeholder="Overview"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">본문 (한국어)</label>
                  <textarea
                    value={block.bodyKo || ""}
                    onChange={(e) => update(i, { bodyKo: e.target.value })}
                    placeholder="한국어 설명"
                    rows={4}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-y"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">본문 (영어)</label>
                  <textarea
                    value={block.bodyEn || ""}
                    onChange={(e) => update(i, { bodyEn: e.target.value })}
                    placeholder="English description"
                    rows={4}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-y"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => add("image")}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          + 이미지 블록
        </button>
        <button
          type="button"
          onClick={() => add("text")}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          + 텍스트 블록
        </button>
      </div>
    </div>
  );
}
