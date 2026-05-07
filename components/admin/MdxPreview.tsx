"use client";

import { useState, useEffect } from "react";
import { defaultFormData, REQUIRED_FORM_FIELDS } from "@/lib/generateMdx";

const FORM_FIELDS = new Set(Object.keys(defaultFormData));

const FIELD_LABELS: Record<string, string> = {
  id: "프로젝트 ID",
  title: "제목 (영문)",
  titleKo: "제목 (한글)",
  location: "위치 (영문)",
  locationKo: "위치 (한글)",
  year: "연도",
  status: "상태",
  client: "클라이언트 (영문)",
  clientKo: "클라이언트 (한글)",
  area: "연면적",
  use: "용도 (영문)",
  useKo: "용도 (한글)",
  category: "카테고리",
  companies: "소속 회사",
  metalogicCategory: "Metalogic 카테고리",
  featured: "메인 노출",
  showOnHome: "홈 목록",
  coverImage: "커버 이미지",
  images: "갤러리 이미지",
  description: "설명 (영문)",
  descriptionKo: "설명 (한글)",
  content: "콘텐츠 블록",
};

interface ExistingProject {
  id: string;
  title: string;
  titleKo: string;
}

interface SchemaField {
  key: string;
  count: number;
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
  const [tab, setTab] = useState<"list" | "mdx" | "schema">("list");
  const [copied, setCopied] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([]);
  const [schemaTotal, setSchemaTotal] = useState(0);
  const [schemaLoaded, setSchemaLoaded] = useState(false);

  useEffect(() => {
    if (tab !== "schema" || schemaLoaded) return;
    fetch("/api/project-schema")
      .then((r) => r.json())
      .then(({ fields, total }) => { setSchemaFields(fields); setSchemaTotal(total); })
      .catch(() => {})
      .finally(() => setSchemaLoaded(true));
  }, [tab, schemaLoaded]);

  function handleCopy() {
    navigator.clipboard.writeText(mdx).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const hasErrors = errors.length > 0;

  // 배포 MDX에 있는 키 중 폼에 없는 것
  const mdxOnly = schemaFields.filter((f) => !FORM_FIELDS.has(f.key));
  // 폼에 있는 키 중 배포 MDX에 없는 것
  const mdxKeys = new Set(schemaFields.map((f) => f.key));
  const formOnly = [...FORM_FIELDS].filter((k) => !mdxKeys.has(k));

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
        <button
          type="button"
          onClick={() => setTab("schema")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "schema" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          스키마
        </button>
      </div>

      {/* 기존 프로젝트 탭 */}
      {tab === "list" && (
        <div className="space-y-1">
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
        <div className="flex flex-col">
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
            rows={mdx.split('\n').length + 2}
            className="w-full font-mono text-xs border border-gray-200 rounded-lg p-3 bg-gray-50 resize-none focus:outline-none"
            spellCheck={false}
          />
          <p className="mt-2 text-xs text-gray-400 shrink-0">
            이 파일을 <code className="bg-gray-100 px-1 rounded">public/projects/{projectId || "{id}"}/</code> 폴더에 넣으세요.
          </p>
        </div>
      )}

      {/* 스키마 탭 */}
      {tab === "schema" && (
        <div>
          {!schemaLoaded ? (
            <p className="text-xs text-gray-400 text-center py-8">불러오는 중...</p>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">배포 프로젝트 {schemaTotal}개 기준</p>

              {/* 불일치 경고 */}
              {(mdxOnly.length > 0 || formOnly.length > 0) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                  {mdxOnly.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-700 mb-1">배포 MDX에만 있음 (폼 미지원)</p>
                      <div className="flex flex-wrap gap-1">
                        {mdxOnly.map((f) => (
                          <span key={f.key} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">
                            {f.key} <span className="text-amber-500">{f.count}/{schemaTotal}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {formOnly.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-700 mb-1">폼에만 있음 (배포 MDX 미사용)</p>
                      <div className="flex flex-wrap gap-1">
                        {formOnly.map((k) => (
                          <span key={k} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 전체 필드 목록 */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1.5 text-gray-400 font-normal">필드</th>
                    <th className="text-center py-1.5 text-gray-400 font-normal border-l border-gray-100 w-16">필수/선택</th>
                    <th className="text-center py-1.5 text-gray-400 font-normal border-l border-gray-100 w-16">입력폼에</th>
                    <th className="text-center py-1.5 text-gray-400 font-normal border-l border-gray-100 w-16">배포Web에</th>
                  </tr>
                </thead>
                <tbody>
                  {[...new Set([...schemaFields.map((f) => f.key), ...FORM_FIELDS])].map((key) => {
                    const mdxField = schemaFields.find((f) => f.key === key);
                    const inForm = FORM_FIELDS.has(key);
                    const isRequired = REQUIRED_FORM_FIELDS.has(key);
                    const mdxVal = mdxField
                      ? <span className={mdxField.count === schemaTotal ? "text-green-600" : "text-amber-500"}>{mdxField.count}/{schemaTotal}</span>
                      : <span className="text-gray-300">—</span>;
                    return (
                      <tr key={key} className="border-b border-gray-50">
                        <td className="py-1.5">
                          {FIELD_LABELS[key] && <span className="text-gray-800 text-xs mr-1.5">{FIELD_LABELS[key]}</span>}
                          <span className="font-mono text-gray-300 text-xs">{key}</span>
                        </td>
                        <td className="py-1.5 text-center border-l border-gray-100 text-xs">
                          {isRequired ? <span className="text-red-500 font-medium">필수 *</span> : <span className="text-gray-400">선택</span>}
                        </td>
                        <td className="py-1.5 text-center border-l border-gray-100 text-xs">
                          {inForm ? <span className="text-gray-700">있음</span> : <span className="text-gray-300">없음</span>}
                        </td>
                        <td className="py-1.5 text-center border-l border-gray-100">{mdxVal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
