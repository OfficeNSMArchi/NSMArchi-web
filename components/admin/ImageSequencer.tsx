"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import GoogleMap from "@/components/GoogleMap";
import { ContentBlock } from "@/lib/generateMdx";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
  useDroppable, useDraggable,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ── Types ────────────────────────────────────────────────────────

type SeqImage = { id: string; kind: "image"; filename: string; checked: boolean; captionKo: string; captionEn: string; showCaption: boolean; expanded: boolean; slides: string[]; slideInterval: number; slideCaptions: { ko: string; en: string }[]; };
type SeqText  = { id: string; kind: "text"; showTitle: boolean; titleKo: string; titleEn: string; bodyKo: string; bodyEn: string; expanded: boolean };
type SeqMap   = { id: string; kind: "map"; address: string; lat?: number; lng?: number; zoom: number; mapType?: "roadmap" | "satellite" | "hybrid"; expanded: boolean };
type SeqItem  = SeqImage | SeqText | SeqMap;

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

// ── Auto-resizing textarea ────────────────────────────────────────

function AutoTextarea({ value, onChange, placeholder, className }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [value]);
  return (
    <textarea ref={ref} value={value} onChange={onChange} placeholder={placeholder} rows={1}
      className={`${className} resize-none overflow-hidden`} />
  );
}

// ── Helpers ───────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2); }

/** Derive content blocks from sequence (cover is separate) */
function deriveContent(seq: SeqItem[]): ContentBlock[] {
  const content: ContentBlock[] = [];
  for (const item of seq) {
    if (item.kind === "image" && item.checked) {
      const hasSlideCaptions = item.slideCaptions.some(c => c.ko || c.en);
      content.push({ type: "image", src: item.filename, alt: "", caption: item.captionEn || undefined, captionKo: item.captionKo || undefined, showCaption: item.showCaption || undefined, slides: item.slides.length ? item.slides : undefined, slideInterval: item.slides.length ? item.slideInterval : undefined, slideCaptions: hasSlideCaptions ? item.slideCaptions.map(c => ({ ko: c.ko || undefined, en: c.en || undefined })) : undefined });
    } else if (item.kind === "text") {
      content.push({ type: "text", titleKo: item.showTitle ? item.titleKo : "", titleEn: item.showTitle ? item.titleEn : "", bodyKo: item.bodyKo, bodyEn: item.bodyEn });
    } else if (item.kind === "map") {
      content.push({ type: "map", address: item.address, lat: item.lat, lng: item.lng, zoom: item.zoom, mapType: item.mapType });
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
        seq.push({ id: uid(), kind: "image", filename: fn, checked: true, captionKo: block.captionKo ?? "", captionEn: block.caption ?? "", showCaption: block.showCaption ?? true, expanded: false, slides: block.slides ?? [], slideInterval: block.slideInterval ?? 3, slideCaptions: (block.slideCaptions ?? []).map(c => ({ ko: c.ko ?? "", en: c.en ?? "" })) });
        used.add(fn);
      }
    } else if (block.type === "text") {
      seq.push({
        id: uid(), kind: "text",
        showTitle: !!(block.titleKo || block.titleEn),
        titleKo: block.titleKo ?? "", titleEn: block.titleEn ?? "",
        bodyKo: block.bodyKo ?? "", bodyEn: block.bodyEn ?? "",
        expanded: false,
      });
    } else if (block.type === "map") {
      seq.push({
        id: uid(), kind: "map",
        address: block.address ?? "", lat: block.lat, lng: block.lng, zoom: block.zoom ?? 15,
        mapType: block.mapType,
        expanded: false,
      });
    }
  }

  // Remaining uploaded files go into pool (unchecked)
  for (const f of files) {
    if (!used.has(f.name)) {
      seq.push({ id: uid(), kind: "image", filename: f.name, checked: false, captionKo: "", captionEn: "", showCaption: true, expanded: false, slides: [], slideInterval: 3, slideCaptions: [] });
    }
  }

  return seq;
}

/** Assign display badges: content images → 블록N, text blocks → 텍스트N */
function getBadges(seq: SeqItem[]): Map<string, string> {
  const map = new Map<string, string>();
  let imgN = 0;
  let txtN = 0;
  let mapN = 0;
  for (const item of seq) {
    if (item.kind === "image" && item.checked) {
      imgN++;
      map.set(item.id, `블록${imgN}`);
    } else if (item.kind === "text") {
      txtN++;
      map.set(item.id, `텍스트${txtN}`);
    } else if (item.kind === "map") {
      mapN++;
      map.set(item.id, `지도${mapN}`);
    }
  }
  return map;
}

// ── Fixed Cover Card (non-draggable) ─────────────────────────────

function FixedCoverCard({ blobUrl, onUnset }: { blobUrl?: string; onUnset: () => void }) {
  // 커버 슬롯 — 시퀀스 이미지를 드래그해서 놓으면 커버로 설정
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: '__cover__' });
  // 커버 이미지 — 드래그해서 시퀀스로 옮기면 커버 해제
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: '__cover_item__',
    disabled: !blobUrl,
  });

  return (
    <div
      ref={setDropRef}
      className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${
        isOver ? 'border-orange-500 scale-105' : 'border-orange-400'
      } ${isDragging ? 'opacity-40' : ''}`}
    >
      {blobUrl ? (
        /* 커버 이미지 — 드래그 가능 */
        <div
          ref={setDragRef} {...attributes} {...listeners}
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
          title="드래그하여 시퀀스로 이동 (커버 해제)"
        >
          <img src={blobUrl} alt="cover" className="w-full h-full object-cover pointer-events-none" />
        </div>
      ) : (
        /* 커버 없음 — 로고 플레이스홀더 */
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1 pointer-events-none">
          <img src="/branding/nsm-mark.svg" alt="no cover" className="w-10 h-10 opacity-20" />
          <span className={`text-[9px] ${isOver ? 'text-orange-500 font-medium' : 'text-gray-300'}`}>
            {isOver ? '여기에 놓기' : '커버 없음'}
          </span>
        </div>
      )}
      {/* ✕ — 커버 해제 (파일은 시퀀스로 복귀) */}
      {blobUrl && (
        <button type="button" onClick={onUnset} title="커버 해제"
          className="absolute top-1 left-1 w-5 h-5 bg-black/60 hover:bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px] transition-colors z-10 cursor-pointer touch-auto"
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

function SortableImageItem({ item, badge, blobUrl, onCheck, onRemove, onCaptionToggle }: {
  item: SeqImage; badge: string; blobUrl?: string;
  onCheck: () => void; onRemove: () => void; onCaptionToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 flex-shrink-0 select-none cursor-grab active:cursor-grabbing touch-none ${
        item.expanded ? "border-amber-400" : item.checked ? "border-blue-500" : "border-gray-200"
      }`}
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
      {item.checked && (
        <button type="button"
          onClick={(e) => { e.stopPropagation(); onCaptionToggle(); }}
          className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] transition-colors z-10 cursor-pointer touch-auto ${
            item.captionKo || item.captionEn ? "bg-amber-500" : "bg-black/60 hover:bg-amber-500"
          }`}
          title="캡션 편집"
        >T</button>
      )}
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

// ── Sortable Map Item ─────────────────────────────────────────────

function SortableMapItem({ item, badge, onToggle, onRemove }: {
  item: SeqMap; badge: string;
  onToggle: () => void; onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="relative w-24 h-24 rounded-lg border-2 border-green-400 bg-green-50 flex-shrink-0 select-none cursor-grab active:cursor-grabbing touch-none"
      onClick={onToggle}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none">
        <span className="text-xl">🗺</span>
        <span className="text-[10px] text-green-600 font-medium">{badge}</span>
        <span className="text-[9px] text-green-400">{item.expanded ? "▲" : "▼"}</span>
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
          .map((f) => ({ id: uid(), kind: "image" as const, filename: f.name, checked: false, captionKo: "", captionEn: "", showCaption: true, expanded: false, slides: [], slideInterval: 3, slideCaptions: [] }));
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

    // 시퀀스 이미지 → 커버 슬롯으로 드롭
    if (over?.id === '__cover__' && active.id !== '__cover_item__') {
      const item = sequence.find((i) => i.id === active.id && i.kind === "image") as SeqImage | undefined;
      if (!item) return;
      // 기존 커버가 있으면 시퀀스 맨 앞으로 복귀
      if (coverImage) {
        const restoredCover: SeqImage = {
          id: uid(), kind: "image", filename: coverImage,
          checked: false, captionKo: "", captionEn: "", showCaption: true,
          expanded: false, slides: [], slideInterval: 3, slideCaptions: [],
        };
        setSequence((s) => [restoredCover, ...s.filter((i) => i.id !== active.id)]);
      } else {
        setSequence((s) => s.filter((i) => i.id !== active.id));
      }
      setCoverImage(item.filename);
      return;
    }

    // 커버 이미지 → 시퀀스로 드래그 (커버 해제)
    if (active.id === '__cover_item__') {
      unsetCover();
      return;
    }

    // 시퀀스 내 순서 변경
    if (!over || active.id === over.id) return;
    setSequence((s) => {
      const oldIdx = s.findIndex((i) => i.id === active.id);
      const newIdx = s.findIndex((i) => i.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return s;
      return arrayMove(s, oldIdx, newIdx);
    });
  }

  function toggleCheck(id: string) {
    // 클릭 = 콘텐츠 포함/제외 토글만. 커버 설정은 드래그로 처리.
    setSequence((s) => s.map((i) => i.id === id && i.kind === "image" ? { ...i, checked: !i.checked } : i));
  }

  function unsetCover() {
    if (!coverImage) return;
    // 파일은 유지하고 커버만 해제 — 시퀀스 맨 앞에 unchecked 상태로 복귀
    const restored: SeqImage = {
      id: uid(), kind: "image", filename: coverImage,
      checked: false, captionKo: "", captionEn: "", showCaption: true,
      expanded: false, slides: [], slideInterval: 3, slideCaptions: [],
    };
    setSequence((s) => [restored, ...s]);
    setCoverImage("");
  }

  function toggleExpand(id: string) {
    setSequence((s) => s.map((i) => {
      if (i.kind === "text") return { ...i, expanded: i.id === id ? !i.expanded : false };
      if (i.kind === "image") return { ...i, expanded: false };
      return i;
    }));
    setDescExpanded(false);
  }

  function toggleExpandImage(id: string) {
    setSequence((s) => s.map((i) => {
      if (i.kind === "image") return { ...i, expanded: i.id === id ? !i.expanded : false };
      if (i.kind === "text") return { ...i, expanded: false };
      if (i.kind === "map") return { ...i, expanded: false };
      return i;
    }));
    setDescExpanded(false);
  }

  function updateImage(id: string, patch: Partial<SeqImage>) {
    setSequence((s) => s.map((i) => i.id === id && i.kind === "image" ? { ...i, ...patch } : i));
  }

  function toggleSlide(id: string, filename: string) {
    setSequence((s) => s.map((i) => {
      if (i.id !== id || i.kind !== "image") return i;
      const slides = i.slides.includes(filename)
        ? i.slides.filter(f => f !== filename)
        : [...i.slides, filename];
      return { ...i, slides };
    }));
  }

  function toggleDesc() {
    const willOpen = !descExpanded;
    if (willOpen) {
      setSequence((s) => s.map((i) =>
        i.kind === "text" || i.kind === "image" || i.kind === "map" ? { ...i, expanded: false } : i
      ));
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
      ...s.map((i) => i.kind === "text" || i.kind === "map" || i.kind === "image" ? { ...i, expanded: false } : i),
      { id: uid(), kind: "text", showTitle: true, titleKo: "-", titleEn: "-", bodyKo: "-", bodyEn: "-", expanded: true },
    ]);
    setDescExpanded(false);
  }

  function addMapBlock() {
    setSequence((s) => [
      ...s.map((i) => i.kind === "text" || i.kind === "map" || i.kind === "image" ? { ...i, expanded: false } : i),
      { id: uid(), kind: "map", address: "", zoom: 15, expanded: true },
    ]);
    setDescExpanded(false);
  }

  function toggleExpandMap(id: string) {
    setSequence((s) => s.map((i) => {
      if (i.kind === "map") return { ...i, expanded: i.id === id ? !i.expanded : false };
      if (i.kind === "text") return { ...i, expanded: false };
      if (i.kind === "image") return { ...i, expanded: false };
      return i;
    }));
    setDescExpanded(false);
  }

  function updateMap(id: string, patch: Partial<SeqMap>) {
    setSequence((s) => s.map((i) => i.id === id && i.kind === "map" ? { ...i, ...patch } : i));
  }

  // ── Map geocoding ──────────────────────────────────────────────

  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");

  async function searchMapAddress(id: string, address: string) {
    if (!address.trim()) return;
    setGeocoding(true);
    setGeocodeError("");
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data.lat != null) {
        updateMap(id, { lat: data.lat, lng: data.lng, address: data.formattedAddress });
      } else {
        setGeocodeError("위치를 찾을 수 없습니다.");
      }
    } catch {
      setGeocodeError("검색 중 오류가 발생했습니다.");
    } finally {
      setGeocoding(false);
    }
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

  async function translateImageCaption(id: string, ko: string) {
    const en = await translateText(ko, `${id}-caption`);
    if (en) updateImage(id, { captionEn: en });
  }

  async function translateSlideCaption(id: string, slideIdx: number, ko: string) {
    const en = await translateText(ko, `${id}-slide-${slideIdx}`);
    if (en) updateSlideCaption(id, slideIdx, "en", en);
  }

  function updateSlideCaption(id: string, slideIdx: number, field: "ko" | "en", value: string) {
    setSequence(s => s.map(i => {
      if (i.id !== id || i.kind !== "image") return i;
      const caps = [...i.slideCaptions];
      while (caps.length <= slideIdx) caps.push({ ko: "", en: "" });
      caps[slideIdx] = { ...caps[slideIdx], [field]: value };
      return { ...i, slideCaptions: caps };
    }));
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

      {/* Fixed row: Cover + Description (always visible) */}
      {/* DndContext가 커버 슬롯과 시퀀스를 모두 감쌈 — 커버↔시퀀스 드래그 지원 */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-2 items-start flex-wrap">
        <FixedCoverCard blobUrl={coverBlobUrl} onUnset={unsetCover} />
        <FixedDescCard expanded={descExpanded} onToggle={toggleDesc} />

        {/* Separator */}
        <div className="w-px self-stretch bg-gray-200 mx-1" />

        {/* Draggable sequence */}
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
                      onCaptionToggle={() => toggleExpandImage(item.id)}
                    />
                  );
                }
                if (item.kind === "map") {
                  return (
                    <SortableMapItem
                      key={item.id} item={item} badge={badge}
                      onToggle={() => toggleExpandMap(item.id)}
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
      </div>
      </DndContext>

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
              <AutoTextarea value={descriptionKo} onChange={(e) => onDescriptionChange(e.target.value, description)}
                placeholder="프로젝트 소개..." className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>설명 (영어)</span>
                <button type="button" onClick={translateDesc} disabled={translating === "desc" || !descriptionKo.trim()}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-100 hover:bg-emerald-200 text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  {translating === "desc" ? "번역 중…" : "✨ AI 번역"}
                </button>
              </label>
              <AutoTextarea value={description} onChange={(e) => onDescriptionChange(descriptionKo, e.target.value)}
                placeholder="Project overview..." className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Inline editor — image caption */}
      {(() => {
        const expandedImg = sequence.find((i) => i.kind === "image" && i.expanded) as SeqImage | undefined;
        if (!expandedImg) return null;
        const imgBadge = badges.get(expandedImg.id) ?? "이미지";
        return (
          <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600">🖼 {imgBadge} 캡션 편집</span>
              <button type="button" onClick={() => toggleExpandImage(expandedImg.id)} className="text-xs text-gray-400 hover:text-gray-600">▲ 접기</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">캡션 (한국어)</label>
                <input type="text" value={expandedImg.captionKo} onChange={(e) => updateImage(expandedImg.id, { captionKo: e.target.value })}
                  placeholder="이미지 설명..." className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>캡션 (영어)</span>
                  <button type="button" onClick={() => translateImageCaption(expandedImg.id, expandedImg.captionKo)}
                    disabled={translating === `${expandedImg.id}-caption` || !expandedImg.captionKo.trim()}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    {translating === `${expandedImg.id}-caption` ? "번역 중…" : "✨ AI 번역"}
                  </button>
                </label>
                <input type="text" value={expandedImg.captionEn} onChange={(e) => updateImage(expandedImg.id, { captionEn: e.target.value })}
                  placeholder="Image description..." className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                checked={expandedImg.showCaption}
                onChange={(e) => updateImage(expandedImg.id, { showCaption: e.target.checked })}
                className="w-3.5 h-3.5 accent-amber-500"
              />
              <span className="text-xs text-gray-600">캡션 표시</span>
            </label>

            {/* 슬라이드쇼 */}
            <div className="border-t border-amber-100 pt-3 space-y-2">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox"
                    checked={expandedImg.slides.length > 0}
                    onChange={(e) => updateImage(expandedImg.id, { slides: e.target.checked ? [] : [] })}
                    className="w-3.5 h-3.5 accent-amber-500"
                  />
                  <span className="text-xs text-gray-600">슬라이드쇼 (여러 장 순환)</span>
                </label>
                {expandedImg.slides.length > 0 && (
                  <label className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span>전환 간격</span>
                    <select value={expandedImg.slideInterval}
                      onChange={(e) => updateImage(expandedImg.id, { slideInterval: Number(e.target.value) })}
                      className="border border-gray-300 rounded px-1 py-0.5 text-xs bg-white">
                      {[2, 3, 4, 5, 8].map(s => <option key={s} value={s}>{s}초</option>)}
                    </select>
                  </label>
                )}
              </div>
              {uploadedFiles.length > 1 && (
                <div className="grid grid-cols-6 gap-1">
                  {uploadedFiles
                    .filter(f => f.name !== expandedImg.filename)
                    .map(f => {
                      const isSelected = expandedImg.slides.includes(f.name);
                      return (
                        <button key={f.name} type="button"
                          onClick={() => toggleSlide(expandedImg.id, f.name)}
                          className={`relative aspect-square rounded overflow-hidden border-2 transition-colors ${
                            isSelected ? "border-amber-400" : "border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <img src={blobUrls.get(f.name)} alt={f.name} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-amber-400/30 flex items-center justify-center">
                              <span className="text-white text-xs font-bold drop-shadow">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
              )}
              {expandedImg.slides.length > 0 && (
                <>
                  <p className="text-[10px] text-gray-400">{expandedImg.slides.length}장 추가 · 총 {expandedImg.slides.length + 1}장 순환</p>
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-semibold text-amber-700">슬라이드별 이름</p>
                    {expandedImg.slides.map((src, si) => {
                      const cap = expandedImg.slideCaptions[si] ?? { ko: "", en: "" };
                      return (
                        <div key={si} className="bg-white border border-amber-100 rounded p-2 space-y-1.5">
                          <p className="text-[10px] text-gray-400 truncate">`[${si + 2}] ${src}`</p>
                          <div className="grid grid-cols-2 gap-2">
                            <textarea
                              value={cap.ko}
                              onChange={(e) => updateSlideCaption(expandedImg.id, si, "ko", e.target.value)}
                              placeholder="한국어 이름"
                              rows={2}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs resize-none"
                            />
                            <div className="flex gap-1">
                              <textarea
                                value={cap.en}
                                onChange={(e) => updateSlideCaption(expandedImg.id, si, "en", e.target.value)}
                                placeholder="English name"
                                rows={2}
                                className="flex-1 min-w-0 border border-gray-300 rounded px-2 py-1 text-xs resize-none"
                              />
                              <button
                                type="button"
                                onClick={() => translateSlideCaption(expandedImg.id, si, cap.ko)}
                                disabled={translating === `${expandedImg.id}-slide-${si}` || !cap.ko.trim()}
                                className="shrink-0 px-1.5 py-1 rounded text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="AI 번역"
                              >
                                {translating === `${expandedImg.id}-slide-${si}` ? "…" : "✨"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* Inline editor — text block */}
      {expandedText && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600">📝 {badges.get(expandedText.id)} 편집</span>
            <button type="button" onClick={() => toggleExpand(expandedText.id)} className="text-xs text-gray-400 hover:text-gray-600">▲ 접기</button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
            <input type="checkbox" checked={expandedText.showTitle}
              onChange={(e) => updateText(expandedText.id, { showTitle: e.target.checked })}
              className="w-3.5 h-3.5 accent-blue-500" />
            <span className="text-xs text-gray-600">제목 표시</span>
          </label>
          {expandedText.showTitle && (
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
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">본문 (한국어)</label>
              <AutoTextarea value={expandedText.bodyKo} onChange={(e) => updateText(expandedText.id, { bodyKo: e.target.value })}
                placeholder="한국어 설명" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
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
              <AutoTextarea value={expandedText.bodyEn} onChange={(e) => updateText(expandedText.id, { bodyEn: e.target.value })}
                placeholder="English description" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Inline editor — map block */}
      {(() => {
        const expandedMap = sequence.find((i) => i.kind === "map" && i.expanded) as SeqMap | undefined;
        if (!expandedMap) return null;
        const mapBadge = badges.get(expandedMap.id) ?? "지도";
        return (
          <div className="border border-green-200 rounded-lg p-4 bg-green-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-green-600">🗺 {mapBadge} 편집</span>
              <button type="button" onClick={() => toggleExpandMap(expandedMap.id)} className="text-xs text-gray-400 hover:text-gray-600">▲ 접기</button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={expandedMap.address}
                onChange={(e) => updateMap(expandedMap.id, { address: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); searchMapAddress(expandedMap.id, expandedMap.address); } }}
                placeholder="주소 또는 장소명 (예: 서울시 종로구 사직로 161)"
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => searchMapAddress(expandedMap.id, expandedMap.address)}
                disabled={geocoding || !expandedMap.address.trim()}
                className="px-3 py-1 text-sm border border-green-400 text-green-700 rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {geocoding ? "검색 중..." : "위치 검색"}
              </button>
            </div>
            {geocodeError && <p className="text-xs text-red-500">{geocodeError}</p>}
            {/* 좌표 없으면 서울 중심으로 빈 지도 표시 — 클릭으로 핀 찍기 */}
            <GoogleMap
              lat={expandedMap.lat ?? 37.5665} lng={expandedMap.lng ?? 126.978}
              zoom={expandedMap.lat != null ? expandedMap.zoom : 11}
              mapType={expandedMap.mapType}
              height={260}
              onPinDrop={(lat, lng, address) => updateMap(expandedMap.id, { lat, lng, address: address || expandedMap.address })}
            />
            {expandedMap.lat != null && expandedMap.lng != null && (
              <>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">위도 (lat)</label>
                    <input type="number" step="any" value={expandedMap.lat}
                      onChange={(e) => updateMap(expandedMap.id, { lat: parseFloat(e.target.value) })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">경도 (lng)</label>
                    <input type="number" step="any" value={expandedMap.lng}
                      onChange={(e) => updateMap(expandedMap.id, { lng: parseFloat(e.target.value) })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">줌 레벨</label>
                    <select value={expandedMap.zoom}
                      onChange={(e) => updateMap(expandedMap.id, { zoom: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white">
                      {[12, 13, 14, 15, 16, 17, 18].map((z) => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">지도 타입</label>
                    <select value={expandedMap.mapType ?? "roadmap"}
                      onChange={(e) => updateMap(expandedMap.id, { mapType: e.target.value as SeqMap["mapType"] })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white">
                      <option value="roadmap">일반</option>
                      <option value="satellite">위성</option>
                      <option value="hybrid">위성+라벨</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })()}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={addTextBlock}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
        >
          📝 텍스트 블록 추가
        </button>
        <button
          type="button"
          onClick={addMapBlock}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
        >
          🗺 맵 블록 추가
        </button>
      </div>

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
