"use client";

import { ContentBlock } from "@/lib/generateMdx";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  images?: string[];
}

interface BlockItemProps {
  id: string;
  index: number;
  block: ContentBlock;
  total: number;
  images: string[];
  onRemove: () => void;
  onUpdate: (patch: Partial<ContentBlock>) => void;
}

function BlockItem({ id, index, block, total, images, onRemove, onUpdate }: BlockItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing px-1.5 py-1 text-gray-300 hover:text-gray-500 rounded hover:bg-gray-200 touch-none"
            title="드래그하여 순서 변경"
          >
            ⠿
          </button>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {block.type === "image" ? "🖼 이미지 블록" : "📝 텍스트 블록"} #{index + 1}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50"
        >
          ×
        </button>
      </div>

      {block.type === "image" ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">파일명 / URL</label>
            {images.length > 0 ? (
              <select
                value={block.src || ""}
                onChange={(e) => onUpdate({ src: e.target.value })}
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
                onChange={(e) => onUpdate({ src: e.target.value })}
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
              onChange={(e) => onUpdate({ alt: e.target.value })}
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
                onChange={(e) => onUpdate({ titleKo: e.target.value })}
                placeholder="개요"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">제목 (영어)</label>
              <input
                type="text"
                value={block.titleEn || ""}
                onChange={(e) => onUpdate({ titleEn: e.target.value })}
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
                onChange={(e) => onUpdate({ bodyKo: e.target.value })}
                placeholder="한국어 설명"
                rows={4}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-y"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">본문 (영어)</label>
              <textarea
                value={block.bodyEn || ""}
                onChange={(e) => onUpdate({ bodyEn: e.target.value })}
                placeholder="English description"
                rows={4}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-y"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContentBlockEditor({ blocks, onChange, images = [] }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const ids = blocks.map((_, i) => String(i));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);
    onChange(arrayMove(blocks, oldIndex, newIndex));
  }

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

  function update(i: number, patch: Partial<ContentBlock>) {
    onChange(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {blocks.map((block, i) => (
            <BlockItem
              key={i}
              id={String(i)}
              index={i}
              block={block}
              total={blocks.length}
              images={images}
              onRemove={() => remove(i)}
              onUpdate={(patch) => update(i, patch)}
            />
          ))}
        </SortableContext>
      </DndContext>

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
