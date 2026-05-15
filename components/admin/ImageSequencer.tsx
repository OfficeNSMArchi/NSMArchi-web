"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { ContentBlock } from "@/lib/generateMdx";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ── Types ────────────────────────────────────────────────────────

type SeqImage = { id: string; kind: "image"; filename: string; checked: boolean };
type SeqText  = { id: string; kind: "text"; titleKo: string; titleEn: string; bodyKo: string; bodyEn: string; expanded: boolean };
type SeqItem  = SeqImage | SeqText;

export interface ImageSequencerProps {
  uploadedFiles: File[];
  blobUrls: Map<string, string>;
  initialCoverImage: string;
  initialContent: ContentBlock[];
  description: string;
  descriptionKo: string;
  loadKey: number;
  onCoverChange: (name: string) => void;
  onContentChange: (blocks: ContentBlock[]) => void;
  onDescriptionChange: (ko: string, en: string) => void;
  onRemoveFile: (name: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2); }

/** Derive content blocks from sequence (cover is separate) */
function deriveContent(seq: SeqItem[]): ContentBlock[] {
  const content: ContentBlock[] = [];
  for (const item of seq) {
    if (item.kind === "image" && item.checked) {
      content.push({ type: "image", src: item.filename, alt: "" });
    } else if (item.kind === "text") {
      content.push({ type: "text", titleKo: item.titleKo, titleEn: item.titleEn, bodyKo: item.bodyKo, bodyEn: item.bodyEn });
    }
  }
  return content;
}

/**
 * Build draggable sequence — excludes cover image and desc (both are fixed slots).
 * cover = filename of cover image (excluded from sequence)
 * content = ordered content blocks (images + texts)
 */
function buildSequence(files: File[], cover: string, content: ContentBlock[]): SeqItem[] {
  const seq: SeqItem[] = [];
  const used = new Set<string>();
  if (cover) used.add(cover); // cover lives in fixed slot, not in DnD

  for (const block of content) {
    if (block.type === "image") {
      const fn = block.src ?? "";
      if (fn && !used.has(fn)) {
        seq.push({ id: uid(), kind: "image", filename: fn, checked: true });
        used.add(fn);
      }
    } else if (block.type === "text") {
      seq.push({
        id: uid(), kind: "text",
        titleKo: block.titleKo ?? "", titleEn: block.titleEn ?? "",
        bodyKo: block.bodyKo ?? "", bodyEn: block.bodyEn ?? "",
        expanded: false,
      });
    }
  }

  // Remaining uploaded files go into pool (unchecked)
  for (const f of files) {
    if (!used.has(f.name)) {
      seq.push({ id: uid(), kind: "image", filename: f.name, checked: false });
    }
  }

  return seq;
}

/** Assign display badges: content images → 블록N, text blocks → 텍스트N */
function getBadges(seq: SeqItem[]): Map<string, string> {
  const map = new Map<string, string>();
  let imgN = 0;
  let txtN = 0;
  for (const item of seq) {
    if (item.kind === "image" && item.checked) {
      imgN++;
      map.set(item.id, `블록${imgN}`);
    } else if (item.kind === "text") {
      txtN++;
      map.set(item.id, `텍스트${txtN}`);
    }
  }
  return map;
}

// ── Fixed Cover Card (non-draggable) ─────────────────────────────

function FixedCoverCard({ blobUrl, onRemove }: { blobUrl?: string; onRemove: () => void }) {
  return (
    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-orange-400 flex-shrink-0">
      {blobUrl
        ? <img src={blobUrl} alt="cover" className="w-full h-full object-cover pointer-events-none" />
        : (
          <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-0.5 text-gray-300">
            <span className="text-2xl">🖼</span>
            <span className="text-[9px]">커버 없음</span>
          </div>
        )
      }
      {blobUrl && (
        <button type="button"
          onClick={onRemove}
          className="absolute top-1 left-1 w-5 h-5 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] transition-colors z-10 cursor-pointer"
        >✕</button>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 flex items-center justify-end pointer-events-none">
        <span className="text-[8px] bg-orange-500 text-white px-1 rounded leading-4">커버</span>
      </div>
    </div>
  );
}

// ── Fixed Description Card (non-draggable) ────────────────────────

function FixedDescCard({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <div
      className="relative w-24 h-24 rounded-lg border-2 border-emerald-400 bg-emerald-50 flex-shrink-0 cursor-pointer select-none"
      onClick={onToggle}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none">
        <span className="text-xl">📋</span>
        <span className="text-[10px] text-emerald-600 font-medium">설명</span>
        <span className="text-[9px] text-emerald-400">{expanded ? "▲" : "▼"}</span>
      </div>
    </div>
  );
}

// ── Sortable Image Item ───────────────────────────────────────────

function SortableImageItem({ item, badge, blobUrl, onCheck, onRemove }: {
  item: SeqImage; badge: string; blobUrl?: string;
  onCheck: () => void; onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 flex-shrink-0 select-none cursor-grab active:cursor-grabbing touch-none ${item.checked ? "border-blue-500" : "border-gray-200"}`}
      onClick={onCheck}
    >
      {blobUrl
        ? <img src={blobUrl} alt={item.filename} className="w-full h-full object-cover pointer-events-none" />
        : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">…</div>
      }
      <button type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-1 left-1 w-5 h-5 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] transition-colors z-10 cursor-pointer touch-auto"
      >✕</button>
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 flex items-center gap-1 pointer-events-none">
        <p className="text-white text-[9px] truncate flex-1">{item.filename}</p>
        {badge && <span className="text-[8px] bg-blue-500 text-white px-1 rounded shrink-0 leading-4">{badge}</span>}
      </div>
    </div>
  );
}

// ── Sortable Text Item ────────────────────────────────────────────

function SortableTextItem({ item, badge, onToggle, onRemove }: {
  item: SeqText; badge: string;
  onToggle: () => void; onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="relative w-24 h-24 rounded-lg border-2 border-blue-400 bg-blue-50 flex-shrink-0 select-none cursor-grab active:cursor-grabbing touch-none"
      onClick={onToggle}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none">
        <span className="text-xl">📝</span>
        <span className="text-[10px] text-blue-600 font-medium">{badge}</span>
        <span className="text-[9px] text-blue-400">{item.expanded ? "▲" : "▼"}</span>
      </div>
      <button type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-1 left-1 w-5 h-5 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] transition-colors z-10 cursor-pointer touch-auto"
      >✕</button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

export default function ImageSequencer({
  uploadedFiles, blobUrls, initialCoverImage, initialContent, description, descriptionKo, loadKey,
  onCoverChange, onContentChange, onDescriptionChange, onRemoveFile,
}: ImageSequencerProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Cover is a fixed slot, separate from draggable sequence
  const [coverImage, setCoverImage] = useState<string>(initialCoverImage);
  // Description expanded state, separate from draggable sequence
  const [descExpanded, setDescExpanded] = useState(false);

  const [sequence, setSequence] = useState<SeqItem[]>(() =>
    buildSequence(uploadedFiles, initialCoverImage, initialContent)
  );

  // Rebuild from scratch on external load (loadFromId / loadFromText)
  useEffect(() => {
    setCoverImage(initialCoverImage);
    setSequence(buildSequence(uploadedFiles, initialCoverImage, initialContent));
    prevNamesRef.current = new Set(uploadedFiles.map((f) => f.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadKey]);

  // Sync new/removed files from parent uploadedFiles
  const prevNamesRef = useRef<Set<string>>(new Set(uploadedFiles.map((f) => f.name)));
  useEffect(() => {
    const current = new Set(uploadedFiles.map((f) => f.name));
    const prev = prevNamesRef.current;
    const added = uploadedFiles.filter((f) => !prev.has(f.name));
    const removed = [...prev].filter((n) => !current.has(n));
    if (added.length > 0 || removed.length > 0) {
      // If cover was removed, clear cover
      if (removed.includes(coverImage)) {
        setCoverImage("");
      }
      setSequence((s) => {
        const filtered = s.filter((i) => !(i.kind === "image" && removed.includes(i.filename)));
        // New files go into pool (unchecked), but skip if already = coverImage
        const newItems = added
          .filter((f) => f.name !== coverImage)
          .map((f) => ({ id: uid(), kind: "image" as const, filename: f.name, checked: false }));
        return [...filtered, ...newItems];
      });
    }
    prevNamesRef.current = current;
  }, [uploadedFiles]); // eslint-disable-line react-hooks/exhaustive-deps

  // Notify parent on state changes (skip initial mount)
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    onCoverChange(coverImage);
    onContentChange(deriveContent(sequence));
  }, [sequence, coverImage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ───────────────────────────────────────────────────

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSequence((s) => {
      const oldIdx = s.findIndex((i) => i.id === active.id);
      const newIdx = s.findIndex((i) => i.id === over.id);
      return arrayMove(s, oldIdx, newIdx);
    });
  }

  function toggleCheck(id: string) {
    const item = sequence.find((i) => i.id === id && i.kind === "image") as SeqImage | undefined;
    if (!item) return;

    if (!item.checked && !coverImage) {
      // No cover yet → this image becomes cover (move out of sequence to fixed slot)
      setCoverImage(item.filename);
      setSequence((s) => s.filter((i) => i.id !== id));
    } else {
      // Toggle content inclusion
      setSequence((s) => s.map((i) => i.id === id && i.kind === "image" ? { ...i, checked: !i.checked } : i));
    }
  }

  function removeCover() {
    onRemoveFile(coverImage);
    setCoverImage("");
    // Parent uploadedFiles effect will handle removing from sequence if needed
  }

  function toggleExpand(id: string) {
    setSequence((s) => s.map((i) => {
      if (i.kind !== "text") return i;
      return { ...i, expanded: i.id === id ? !i.expanded : false };
    }));
    // Also close desc if a text block is being opened
    setDescExpanded(false);
  }

  function toggleDesc() {
    const willOpen = !descExpanded;
    if (willOpen) {
      // Close all text block editors
      setSequence((s) => s.map((i) => i.kind === "text" ? { ...i, expanded: false } : i));
    }
    setDescExpanded(willOpen);
  }

  function removeItem(id: string) {
    const item = sequence.find((i) => i.id === id);
    if (item?.kind === "image") onRemoveFile(item.filename);
    setSequence((s) => s.filter((i) => i.id !== id));
  }

  function updateText(id: string, patch: Partial<SeqText>) {
    setSequence((s) => s.map((i) => i.id === id && i.kind === "text" ? { ...i, ...patch } : i));
  }

  function addTextBlock() {
    setSequence((s) => [
      ...s.map((i) => i.kind === "text" ? { ...i, expanded: false } : i),
      { id: uid(), kind: "text", titleKo: "-", titleEn: "-", bodyKo: "-", bodyEn: "-", expanded: true },
    ]);
    setDescExpanded(false);
  }

  // ── Translation ────────────────────────────────────────────────

  const [translating, setTranslating] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  async function translateText(koText: string, key: string): Promise<string> {
    if (!koText.trim() || koText === "-") return "";
    setTranslating(key);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: koText }),
      });
      if (res.status === 401) {
        setShowLoginDialog(true);
        return "";
      }
      if (!res.ok) throw new Error("failed");
      const { translated } = await res.json();
      return translated ?? "";
    } catch {
      alert("번역 실패. GEMINI_API_KEY를 확인해 주세요.");
      return "";
    } finally {
      setTranslating(null);
    }
  }

  async function translateDesc() {
    const en = await translateText(descriptionKo, "desc");
    if (en) onDescriptionChange(descriptionKo, en);
  }

  async function translateBlockTitle(id: string, ko: string) {
    const en = await translateText(ko, `${id}-title`);
    if (en) updateText(id, { titleEn: en });
  }

  async function translateBlockBody(id: string, ko: string) {
    const en = await translateText(ko, `${id}-body`);
    if (en) updateText(id, { bodyEn: en });
  }

  const badges = getBadges(sequence);
  const expandedText = sequence.find((i) => i.kind === "text" && i.expanded) as SeqText | undefined;
  const coverBlobUrl = coverImage ? blobUrls.get(coverImage) : undefined;

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-gray-400">
        클릭으로 포함 여부 선택 (파란 테두리 = 사용 중). 드래그로 순서 변경. 저장 시 모든 사진이 서버에 업로드됩니다.
      </p>
      <p className="text-[11px] text-gray-400 -mt-1">
        커버·설명은 고정 위치. 이미지가 없을 때 첫 체크한 이미지가 자동으로 커버가 됩니다.
      </p>

      {/* Fixed row: Cover + Description (always visible, non-draggable) */}
      <div className="flex gap-2 items-start flex-wrap">
        <FixedCoverCard blobUrl={coverBlobUrl} onRemove={removeCover} />
        <FixedDescCard expanded={descExpanded} onToggle={toggleDesc} />

        {/* Separator */}
        <div className="w-px self-stretch bg-gray-200 mx-1" />

        {/* Draggable sequence */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sequence.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap gap-2 min-h-[6rem] flex-1">
              {sequence.length === 0 && (
                <div className="flex items-center justify-center text-sm text-gray-400 py-4 px-2">
                  위의 드롭존에서 이미지를 업로드하면 여기에 표시됩니다
                </div>
              )}
              {sequence.map((item) => {
                const badge = badges.get(item.id) ?? "";
                if (item.kind === "image") {
                  return (
                    <SortableImageItem
                      key={item.id} item={item} badge={badge}
                      blobUrl={blobUrls.get(item.filename)}
                      onCheck={() => toggleCheck(item.id)}
                      onRemove={() => removeItem(item.id)}
                    />
                  );
                }
                return (
                  <SortableTextItem
                    key={item.id} item={item} badge={badge}
                    onToggle={() => toggleExpand(item.id)}
                    onRemove={() => removeItem(item.id)}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Inline editor — description */}
      {descExpanded && (
        <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600">📋 설명 편집</span>
            <button type="button" onClick={() => setDescExpanded(false)} className="text-xs text-gray-400 hover:text-gray-600">▲ 접기</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">설명 (한국어)</label>
              <textarea value={descriptionKo} onChange={(e) => onDescriptionChange(e.target.value, description)}
                placeholder="프로젝트 소개..." rows={4} className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-y" />
            </div>
            <div>
              <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>설명 (영어)</span>
                <button type="button" onClick={translateDesc} disabled={translating === "desc" || !descriptionKo.trim()}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-100 hover:bg-emerald-200 text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  {translating === "desc" ? "번역 중…" : "✨ AI 번역"}
                </button>
              </label>
              <textarea value={description} onChange={(e) => onDescriptionChange(descriptionKo, e.target.value)}
                placeholder="Project overview..." rows={4} className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-y" />
            </div>
          </div>
        </div>
      )}

      {/* Inline editor — text block */}
      {expandedText && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600">📝 {badges.get(expandedText.id)} 편집</span>
            <button type="button" onClick={() => toggleExpand(expandedText.id)} className="text-xs text-gray-400 hover:text-gray-600">▲ 접기</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">제목 (한국어)</label>
              <input type="text" value={expandedText.titleKo} onChange={(e) => updateText(expandedText.id, { titleKo: e.target.value })}
                placeholder="개요" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>제목 (영어)</span>
                <button type="button" onClick={() => translateBlockTitle(expandedText.id, expandedText.titleKo)}
                  disabled={translating === `${expandedText.id}-title` || !expandedText.titleKo.trim()}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-blue-100 hover:bg-blue-200 text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  {translating === `${expandedText.id}-title` ? "번역 중…" : "✨ AI 번역"}
                </button>
              </label>
              <input type="text" value={expandedText.titleEn} onChange={(e) => updateText(expandedText.id, { titleEn: e.target.value })}
                placeholder="Overview" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">본문 (한국어)</label>
              <textarea value={expandedText.bodyKo} onChange={(e) => updateText(expandedText.id, { bodyKo: e.target.value })}
                placeholder="한국어 설명" rows={4} className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-y" />
            </div>
            <div>
              <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>본문 (영어)</span>
                <button type="button" onClick={() => translateBlockBody(expandedText.id, expandedText.bodyKo)}
                  disabled={translating === `${expandedText.id}-body` || !expandedText.bodyKo.trim()}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-blue-100 hover:bg-blue-200 text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  {translating === `${expandedText.id}-body` ? "번역 중…" : "✨ AI 번역"}
                </button>
              </label>
              <textarea value={expandedText.bodyEn} onChange={(e) => updateText(expandedText.id, { bodyEn: e.target.value })}
                placeholder="English description" rows={4} className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-y" />
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={addTextBlock}
        className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
      >
        📝 텍스트 블록 추가
      </button>

      {/* Login dialog */}
      {showLoginDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowLoginDialog(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 w-80 flex flex-col items-center gap-5" onClick={(e) => e.stopPropagation()}>
            <span className="text-4xl">✨</span>
            <div className="text-center space-y-1.5">
              <p className="font-semibold text-gray-800 text-base">AI 번역 기능</p>
              <p className="text-sm text-gray-500">번역 기능을 사용하려면<br />Google 로그인이 필요합니다.</p>
            </div>
            <button
              type="button"
              onClick={() => {
  setShowLoginDialog(false);
  sessionStorage.setItem("restore_after_login", "1");
  signIn("google", { callbackUrl: window.location.href });
}}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google 로그인
            </button>
            <button type="button" onClick={() => setShowLoginDialog(false)} className="text-xs text-gray-400 hover:text-gray-600">
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
