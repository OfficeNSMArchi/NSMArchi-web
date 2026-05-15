"use client";

import { useState, useRef, useEffect } from "react";
import { ProjectFormData, defaultFormData, generateMdx } from "@/lib/generateMdx";
import { USE_TYPES } from "@/lib/useTypeSchema";
import { STAGE_TYPES, STAGES } from "@/lib/stageSchema";
import { getSizeLabel, formatArea } from "@/lib/projectUtils";
import { parseMdx } from "@/lib/parseMdx";
import { formToProject } from "@/lib/formToProject";
import { ProjectZoomGallery } from "@/components/project-zoom-gallery";
import JSZip from "jszip";
import { Lock, LockOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageSequencer from "./ImageSequencer";
import MdxPreview from "./MdxPreview";
import { useSession, signIn, signOut } from "next-auth/react";
import imageCompression from "browser-image-compression";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function toKebab(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const KNOWN_PREFIXES = ["nsm", "ndb", "snp", "ml"];

function companyPrefix(companies: string[]): string {
  if (companies.length === 0) return "";
  if (companies.length === 1) {
    if (companies[0] === "metalogic") return "ml";
    return companies[0];
  }
  return "nsm";
}

function splitId(id: string): { prefix: string; slug: string } {
  for (const p of KNOWN_PREFIXES) {
    if (id.startsWith(p + "-")) {
      return { prefix: p, slug: id.slice(p.length + 1) };
    }
  }
  return { prefix: "", slug: id };
}

function buildId(prefix: string, slug: string): string {
  if (!prefix && !slug) return "";
  if (!prefix) return slug;
  if (!slug) return prefix;
  return `${prefix}-${slug}`;
}

function validateForm(data: ProjectFormData): string[] {
  const errors: string[] = [];
  if (!data.id || data.id.endsWith("-")) errors.push("프로젝트 ID");
  if (!data.title) errors.push("제목 (영어)");
  if (!data.titleKo) errors.push("제목 (한국어)");
  if (!data.location) errors.push("위치 (영어)");
  if (!data.locationKo) errors.push("위치 (한국어)");
  if (!data.client) errors.push("클라이언트 (영어)");
  if (!data.clientKo) errors.push("클라이언트 (한국어)");
  if (!data.coverImage) errors.push("커버 이미지");
  if (data.companies.length === 0) errors.push("소속 회사 (1개 이상)");
  if (!data.description) errors.push("설명 (영어)");
  if (!data.descriptionKo) errors.push("설명 (한국어)");
  return errors;
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400";
const selectCls = `${inputCls} bg-white`;

const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "gif", "svg"];

function isImageFile(name: string) {
  return IMAGE_EXTS.includes(name.split(".").pop()?.toLowerCase() ?? "");
}


type PublishStatus = "idle" | "publishing" | "success" | "error";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProjectForm() {
  const { data: session } = useSession();
  const [data, setData] = useState<ProjectFormData>(defaultFormData);
  const [idSlug, setIdSlug] = useState("");
  const [slugSync, setSlugSync] = useState(false);
  const [existingProjects, setExistingProjects] = useState<{id: string; title: string; titleKo: string}[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [projectsRefreshIn, setProjectsRefreshIn] = useState(30);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [gitAvailable, setGitAvailable] = useState<boolean | null>(null);
  const [isNarrow, setIsNarrow] = useState(false);
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("idle");
  const [publishError, setPublishError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    fetch("/api/save-local").then(r => r.json()).then(j => setGitAvailable(j.available)).catch(() => setGitAvailable(false));
  }, []);

  useEffect(() => {
    const update = () => { setIsNarrow(window.innerWidth < 1280); };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    function loadProjects() {
      setProjectsLoaded(false);
      fetch("/api/project-ids")
        .then((r) => r.json())
        .then((projects) => setExistingProjects(projects))
        .catch(() => {})
        .finally(() => setProjectsLoaded(true));
    }

    loadProjects();

    const ticker = setInterval(() => {
      setProjectsRefreshIn((n) => {
        if (n <= 1) {
          loadProjects();
          return 30;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    if (!showDownloadMenu) return;
    const handler = () => setShowDownloadMenu(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showDownloadMenu]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (data.id || data.title) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [data.id, data.title]);

  const DRAFT_KEY = "nsm-project-draft";
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) setShowDraftBanner(true);
  }, []);

  useEffect(() => {
    if (data.id || data.title) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, idSlug, slugSync }));
    }
  }, [data, idSlug, slugSync]);

  function restoreDraft() {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    try {
      const { data: d, idSlug: s, slugSync: ss } = JSON.parse(saved);
      setData(d);
      setIdSlug(s);
      setSlugSync(ss ?? false);
    } catch {}
    setShowDraftBanner(false);
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setShowDraftBanner(false);
  }

  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [previewHeight, setPreviewHeight] = useState(420);
  const [previewScale, setPreviewScale] = useState(1);
  const previewResizeRef = useRef<{ active: boolean; startY: number; startH: number }>({ active: false, startY: 0, startH: 0 });

  function handleResizeStart(e: React.PointerEvent) {
    previewResizeRef.current = { active: true, startY: e.clientY, startH: previewHeight };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function handleResizeMove(e: React.PointerEvent) {
    if (!previewResizeRef.current.active) return;
    const next = Math.max(80, Math.min(window.innerHeight * 0.85, previewResizeRef.current.startH + e.clientY - previewResizeRef.current.startY));
    setPreviewHeight(next);
  }
  function handleResizeEnd() { previewResizeRef.current.active = false; }
  const [loadKey, setLoadKey] = useState(0);
  const [newImage, setNewImage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewBlobUrls, setPreviewBlobUrls] = useState<Map<string, string>>(new Map());
  const [galleryBlobUrls, setGalleryBlobUrls] = useState<Map<string, string>>(new Map());
  const [fullBlobUrls, setFullBlobUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const fullMap = new Map(uploadedFiles.map((f) => [f.name, URL.createObjectURL(f)]));
    setFullBlobUrls(fullMap);

    const thumbMap = new Map<string, string>();
    const galleryMap = new Map<string, string>();

    function resizeToBlob(src: string, maxPx: number, quality: number): Promise<string> {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          const scale = Math.min(maxPx / img.width, maxPx / img.height, 1);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => resolve(src);
        img.src = src;
      });
    }

    Promise.all(uploadedFiles.map(async (f) => {
      const src = fullMap.get(f.name) ?? "";
      const [thumb, gallery] = await Promise.all([
        resizeToBlob(src, 400, 0.85),
        resizeToBlob(src, 1920, 0.85),
      ]);
      thumbMap.set(f.name, thumb);
      galleryMap.set(f.name, gallery);
    })).then(() => {
      setPreviewBlobUrls(new Map(thumbMap));
      setGalleryBlobUrls(new Map(galleryMap));
    });

    return () => { fullMap.forEach((url) => URL.revokeObjectURL(url)); };
  }, [uploadedFiles]);
  const [loadMode, setLoadMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [loadError, setLoadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const mdx = generateMdx(data);
  const validationErrors = validateForm(data);
  const existingIds = existingProjects.map((p) => p.id);
  const isDuplicate = !!data.id && existingIds.includes(data.id);

  function set<K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) {
    setData((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && slugSync) {
        const newSlug = toKebab(value as string);
        setIdSlug(newSlug);
        next.id = buildId(companyPrefix(next.companies), newSlug);
      } else if (key === "companies") {
        next.id = buildId(companyPrefix(value as string[]), idSlug);
      }
      return next;
    });
  }

  function toggleCompany(co: "ndb" | "snp" | "metalogic") {
    setData((prev) => {
      const isAdding = !prev.companies.includes(co)
      const companies = isAdding
        ? [...prev.companies, co]
        : prev.companies.filter((c) => c !== co)
      let visibleOn = isAdding
        ? [...prev.visibleOn, co]
        : prev.visibleOn.filter((c) => c !== co)
      if (companies.length >= 2 && !visibleOn.includes("nsm")) visibleOn = [...visibleOn, "nsm"]
      return {
        ...prev,
        companies,
        visibleOn,
        id: buildId(companyPrefix(companies), idSlug),
      };
    });
  }

  function addImage() {
    if (!newImage.trim()) return;
    setData((prev) => ({ ...prev, images: [...prev.images, newImage.trim()] }));
    setNewImage("");
  }

  function removeImage(i: number) {
    setData((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
  }

  function addExtraField() {
    setData((prev) => ({ ...prev, extraFields: { ...prev.extraFields, "": "" } }));
  }
  function removeExtraField(key: string) {
    setData((prev) => {
      const next = { ...prev.extraFields };
      delete next[key];
      return { ...prev, extraFields: next };
    });
  }
  function renameExtraField(oldKey: string, newKey: string) {
    setData((prev) => {
      const next: Record<string, string> = {};
      Object.entries(prev.extraFields).forEach(([k, v]) => {
        next[k === oldKey ? newKey : k] = v;
      });
      return { ...prev, extraFields: next };
    });
  }

  function loadFromText(text: string, images?: File[]) {
    try {
      const parsed = parseMdx(text);
      const { slug } = splitId(parsed.id);
      setIdSlug(slug);
      setSlugSync(false);
      if (images && images.length > 0) {
        parsed.images = images.map((f) => f.name);
        setUploadedFiles(images);
      }
      setData(parsed);
      setLoadKey((k) => k + 1);
      setLoadMode(false);
      setPasteText("");
      setLoadError("");
    } catch {
      setLoadError("MDX 파싱 실패. 올바른 형식인지 확인해주세요.");
    }
  }

  function handleFolder(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const mdxFile = files.find((f) => f.name.endsWith(".mdx") || f.name.endsWith(".md"));
    const imageFiles = files.filter((f) => isImageFile(f.name));
    if (!mdxFile) { setLoadError("폴더 안에 .mdx 파일이 없습니다."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => loadFromText(ev.target?.result as string, imageFiles);
    reader.readAsText(mdxFile);
    e.target.value = "";
  }

  function handleSingleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => loadFromText(ev.target?.result as string);
    reader.readAsText(file);
    e.target.value = "";
  }

  function confirmExisting(): boolean {
    if (isDuplicate) {
      return confirm(`"${data.id}" 는 기존 프로젝트입니다.\n기존 프로젝트의 데이터를 확인 후 교체하세요.`);
    }
    return true;
  }

  async function handleDownloadMdx() {
    if (!confirmExisting()) return;
    const blob = new Blob([mdx], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.id}.mdx`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  }

  async function handleDownloadZip() {
    if (!confirmExisting()) return;
    const zip = new JSZip();
    const folder = zip.folder(data.id)!;
    folder.file(`${data.id}.mdx`, mdx);
    for (const file of uploadedFiles) {
      folder.file(file.name, file);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.id}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  }

  async function handleSaveLocal() {
    if (!confirmExisting()) return;
    try {
      const formData = new FormData();
      formData.append("projectId", data.id);
      formData.append("mdxContent", mdx);
      for (const file of uploadedFiles) {
        formData.append(`image:${file.name}`, file);
      }
      const res = await fetch("/api/save-local", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      alert(`저장 완료: ${json.path}`);
      setShowDownloadMenu(false);
    } catch (e: any) {
      alert(`저장 실패: ${e.message}`);
    }
  }

  async function loadFromId(id: string) {
    try {
      const text = await fetch(`/projects/${id}/${id}.mdx`).then((r) => r.text());
      const parsed = parseMdx(text);

      const toFetch = new Set<string>();
      if (parsed.coverImage) toFetch.add(parsed.coverImage);
      parsed.images.forEach((img) => img && toFetch.add(img));
      parsed.content.forEach((block) => { if (block.type === "image" && block.src) toFetch.add(block.src); });

      const fetched: File[] = [];
      await Promise.all(
        [...toFetch].map(async (name) => {
          try {
            const resp = await fetch(`/projects/${id}/${name}`);
            if (resp.ok) {
              const blob = await resp.blob();
              fetched.push(new File([blob], name, { type: blob.type }));
            }
          } catch {}
        })
      );

      loadFromText(text, fetched.length > 0 ? fetched : undefined);
    } catch {
      alert(`${id}.mdx 를 불러오지 못했습니다.`);
    }
  }

  function handleImageFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) => isImageFile(f.name));
    if (files.length === 0) return;
    setUploadedFiles((prev) => {
      const startIdx = prev.length + 1;
      const renamed = files.map((f, i) => {
        const ext = f.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const newName = `image-${String(startIdx + i).padStart(3, "0")}.${ext}`;
        return new File([f], newName, { type: f.type });
      });
      return [...prev, ...renamed];
    });
    e.target.value = "";
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => loadFromText(ev.target?.result as string);
    reader.readAsText(file);
  }

  async function handlePublish() {
    if (!session) {
      signIn("google", { callbackUrl: "/admin/new-project" });
      return;
    }
    if (validationErrors.length > 0) return;
    if (!confirmExisting()) return;

    setPublishStatus("publishing");
    setPublishError("");

    try {
      const images = await Promise.all(
        uploadedFiles.map(async (file) => {
          const base64 = await fileToBase64(file);
          return { filename: file.name, base64 };
        })
      );

      const res = await fetch("/api/publish-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: data.id, mdxContent: generateMdx(data), images }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "업로드 실패");
      }

      setPublishStatus("success");
      setCountdown(90);
    } catch (e: any) {
      setPublishStatus("error");
      setPublishError(e.message || "알 수 없는 오류");
    }
  }

  return (
    <>
    <div className="flex lg:hidden h-screen items-center justify-center bg-white px-8">
      <div className="text-center">
        <p className="text-lg font-medium text-gray-800 mb-2">데스크탑에서 사용하세요</p>
        <p className="text-sm text-gray-500">이 페이지는 데스크탑 환경에서만 지원됩니다.</p>
      </div>
    </div>
    <div className="hidden lg:flex lg:flex-col h-screen bg-white overflow-hidden">

      {/* ── 창 크기 경고 배너 ── */}
      {isNarrow && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 shrink-0">
          <p className="text-sm text-amber-700">창을 최대한 넓게 확장하면 더 편하게 사용할 수 있습니다.</p>
        </div>
      )}

      {/* ── 헤더 ── */}
      <header className="shrink-0 border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">새 프로젝트 등록</h1>
          <p className="text-xs text-gray-500 mt-0.5">폼을 작성하면 MDX 파일이 자동 생성됩니다</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => { setLoadMode(true); setLoadError(""); }}
            className="hidden lg:block px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            로컬에서 불러오기
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDownloadMenu((v) => !v)}
              disabled={validationErrors.length > 0}
              title={validationErrors.length > 0 ? validationErrors.map((e) => `${e} 누락`).join(", ") : undefined}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <span className="hidden lg:inline">다운로드 {data.id ? `${data.id}` : ""}  </span><span className="lg:hidden">다운로드</span> ▾
            </button>
            {showDownloadMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-48">
                <button
                  type="button"
                  onClick={handleDownloadMdx}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 rounded-t-lg"
                >
                  MDX만 다운로드
                </button>
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-t border-gray-100"
                >
                  ZIP (MDX + 이미지)
                  {uploadedFiles.length > 0 && <span className="ml-1 text-xs text-gray-400">{uploadedFiles.length}개</span>}
                </button>
              </div>
            )}
          </div>

          {/* 로컬 저장 + git push 버튼 */}
          {gitAvailable && (
            <button
              type="button"
              onClick={handleSaveLocal}
              disabled={validationErrors.length > 0}
              title={validationErrors.length > 0 ? validationErrors.map((e) => `${e} 누락`).join(", ") : "로컬에 직접 저장"}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Git Save
            </button>
          )}
          {gitAvailable && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch("/api/git-push", { method: "POST" });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json.error);
                  if (json.message) { alert(json.message); return; }
                  alert(`Push 완료\n\n${json.summary.join("\n")}`);
                } catch (e: any) {
                  alert(`Push 실패: ${e.message}`);
                }
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Git Push
            </button>
          )}

          {/* 홈페이지 등록 버튼 */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={validationErrors.length > 0 || publishStatus === "publishing"}
            title={validationErrors.length > 0 ? validationErrors.map((e) => `${e} 누락`).join(", ") : session ? "GitHub에 커밋하고 홈페이지에 반영" : "로그인 후 홈페이지에 등록"}
            className="px-3 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {publishStatus === "publishing" ? "등록 중…" : session ? "홈페이지에 등록" : "🔒 홈페이지에 등록"}
          </button>

          {/* 로그인 상태 */}
          {session ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500 hidden xl:inline">{session.user?.email}</span>
              <button type="button" onClick={() => signOut({ callbackUrl: "/admin/new-project" })} className="text-xs text-gray-400 hover:text-gray-600">로그아웃</button>
            </div>
          ) : (
            <button type="button" onClick={() => signIn("google", { callbackUrl: "/admin/new-project" })} className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2">
              Google 로그인
            </button>
          )}
        </div>
      </header>

      {/* ── 임시저장 배너 ── */}
      {showDraftBanner && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2.5 flex items-center justify-between shrink-0">
          <p className="text-sm text-blue-700">이전 작업 내용이 있습니다.</p>
          <div className="flex gap-2">
            <button type="button" onClick={restoreDraft} className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">불러오기</button>
            <button type="button" onClick={clearDraft} className="px-3 py-1 text-xs font-medium border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50">무시</button>
          </div>
        </div>
      )}

      {/* ── 미리보기 스트립 ── */}
      <div
        className="shrink-0 overflow-hidden transition-all duration-300"
        style={{ height: previewCollapsed ? 0 : previewHeight }}
      >
        <div
          className="[&_[data-exclude-pin]]:hidden origin-top-left"
          style={{
            transform: `scale(${previewScale}) translateZ(0)`,
            width: `${100 / previewScale}%`,
            height: `${100 / previewScale}%`,
          }}
        >
          <ProjectZoomGallery
            projects={[formToProject(data, galleryBlobUrls)]}
            defaultExpandedId={data.id || "preview"}
          />
        </div>
      </div>
      {/* 드래그 핸들 + 접기/펼치기 버튼 */}
      <div
        className="shrink-0 h-7 flex items-center justify-between px-3 cursor-row-resize bg-gray-100 hover:bg-gray-200 transition-colors border-b border-gray-200 select-none"
        onPointerDown={(e) => { if ((e.target as HTMLElement).closest('button')) return; handleResizeStart(e); }}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        onPointerCancel={handleResizeEnd}
      >
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">미리보기</span>
        <div className="flex items-center gap-1">
          {/* 스케일 드롭다운 */}
          <select
            value={previewScale}
            onChange={(e) => { setPreviewScale(Number(e.target.value)); setPreviewCollapsed(false); }}
            className="text-[11px] text-gray-500 bg-transparent border-none outline-none cursor-pointer hover:text-gray-700 pr-1"
          >
            <option value={0.3}>30%</option>
            <option value={0.5}>50%</option>
            <option value={0.75}>75%</option>
            <option value={1}>100%</option>
          </select>
          <button
            type="button"
            onClick={() => setPreviewCollapsed((v) => !v)}
            className="text-[11px] text-gray-500 hover:text-gray-700 px-2 py-0.5 rounded hover:bg-gray-300 transition-colors"
          >
            {previewCollapsed ? "▼ 펼치기" : "▲ 접기"}
          </button>
        </div>
      </div>

      {/* ── 폼 + MDX ── */}
      <div className="flex flex-1 overflow-y-auto">

        {/* 폼 */}
        <div className="flex-1 p-6 space-y-8">

          {/* 1. 기본 정보 */}
          <section>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">기본 정보</h2>
              <button
                type="button"
                onClick={() => { if (confirm("폼을 초기화할까요?\n중간저장된 내용 모두 없어집니다.")) { setData(defaultFormData); setIdSlug(""); setSlugSync(false); setUploadedFiles([]); clearDraft(); } }}
                className="px-2 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-400"
              >
                초기화
              </button>
            </div>
            <div className="space-y-4">
              <Field label="프로젝트 ID (폴더명)" required>
                <div className="flex items-center gap-0">
                  {/* prefix: 자동 고정 */}
                  <span className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-l-lg text-gray-500 font-mono shrink-0">
                    {companyPrefix(data.companies) || "??"}–
                  </span>
                  {/* slug: 영문제목 기반 추천, 수동 편집 가능 */}
                  <input
                    type="text"
                    value={idSlug}
                    onChange={(e) => {
                      const slug = toKebab(e.target.value);
                      setIdSlug(slug);
                      setSlugSync(false);
                      setData((prev) => ({ ...prev, id: buildId(companyPrefix(prev.companies), slug) }));
                    }}
                    placeholder="직접 입력하거나 🔒 클릭으로 제목 연동"
                    className="flex-1 border border-l-0 border-gray-300 rounded-r-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (slugSync) {
                        setSlugSync(false);
                      } else {
                        const slug = toKebab(data.title);
                        setIdSlug(slug);
                        setSlugSync(true);
                        setData((prev) => ({ ...prev, id: buildId(companyPrefix(prev.companies), slug) }));
                      }
                    }}
                    className="ml-2 shrink-0 px-2 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500"
                    title={slugSync ? "제목 연동 해제" : "제목에 연동"}
                  >
                    {slugSync ? <Lock size={14} /> : <LockOpen size={14} />}
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-xs text-gray-400 font-mono">→ {data.id || "…"}</p>
                  {isDuplicate ? (
                    <p className="text-xs text-amber-600 font-medium">⚠ 기존 프로젝트 ID 입니다 — 업데이트 목적이 아니라면 ID를 변경하세요</p>
                  ) : data.id ? (
                    <p className="text-xs text-green-600 font-medium">✓ 신규 프로젝트 ID 입니다</p>
                  ) : null}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="제목 (한국어)" required>
                  <input type="text" value={data.titleKo} onChange={(e) => set("titleKo", e.target.value)} placeholder="부암동 복합시설" className={inputCls} />
                </Field>
                <Field label="제목 (영어)" required>
                  <input type="text" value={data.title} onChange={(e) => set("title", e.target.value)} placeholder="Buam-dong Complex" className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="위치 (한국어)" required>
                  <input type="text" value={data.locationKo} onChange={(e) => set("locationKo", e.target.value)} placeholder="서울, 한국" className={inputCls} />
                </Field>
                <Field label="위치 (영어)" required>
                  <input type="text" value={data.location} onChange={(e) => set("location", e.target.value)} placeholder="Seoul, Korea" className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <Field label="연도">
                  <div className="flex gap-1">
                    <Select
                      value={data.year?.slice(0, 4) || "__none__"}
                      onValueChange={(v) => {
                        const y = v === "__none__" ? "" : v
                        const m = data.year?.slice(5, 7) ?? ""
                        set("year", y ? (m ? `${y}-${m}` : y) : "")
                      }}
                    >
                      <SelectTrigger className="w-28"><SelectValue placeholder="연도" /></SelectTrigger>
                      <SelectContent side="bottom">
                        <SelectItem value="__none__">연도</SelectItem>
                        {Array.from({ length: new Date().getFullYear() - 1990 + 1 }, (_, i) => String(new Date().getFullYear() - i)).map(y => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={data.year?.slice(5, 7) || "__none__"}
                      onValueChange={(v) => {
                        const m = v === "__none__" ? "" : v
                        const y = data.year?.slice(0, 4) ?? ""
                        set("year", m ? `${y}-${m}` : y)
                      }}
                    >
                      <SelectTrigger className="w-20"><SelectValue placeholder="월" /></SelectTrigger>
                      <SelectContent side="bottom">
                        <SelectItem value="__none__">월</SelectItem>
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(m => (
                          <SelectItem key={m} value={m}>{m}월</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Field>
                <Field label="스테이지 타입">
                  <select value={data.stageType} onChange={(e) => { set("stageType", e.target.value as ProjectFormData["stageType"]); set("stage", 0) }} className={selectCls}>
                    <option value="">— 미설정 —</option>
                    <option value="design">Design</option>
                    <option value="research">Research</option>
                    <option value="software">Software</option>
                  </select>
                </Field>
                <Field label="단계">
                  <select value={data.stage} onChange={(e) => set("stage", Number(e.target.value))} className={selectCls} disabled={!data.stageType}>
                    {data.stageType
                      ? (STAGES[data.stageType as keyof typeof STAGES]).map((s) => (
                          <option key={s.key} value={s.key}>{s.key} — {s.ko}{s.hint ? ` (${s.hint})` : ""}</option>
                        ))
                      : <option value="">— 스테이지 타입 선택 후 설정 —</option>
                    }
                  </select>
                </Field>
                <Field label="연면적">
                  <div className="flex items-center gap-2">
                    <input
                      type="text" inputMode="numeric"
                      value={data.area === "-" ? "" : data.area}
                      onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !["Backspace","Delete","ArrowLeft","ArrowRight","Tab"].includes(e.key)) e.preventDefault() }}
                      onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ""); set("area", val || "-") }}
                      placeholder="7844" className={inputCls}
                    />
                    <span className="text-sm text-gray-500 shrink-0">m²</span>
                    {getSizeLabel(data.area) && (
                      <span className="text-xs font-bold text-gray-400 shrink-0">{getSizeLabel(data.area)}</span>
                    )}
                  </div>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="클라이언트 (한국어)" required>
                  <input type="text" value={data.clientKo} onChange={(e) => set("clientKo", e.target.value)} placeholder="서울시" className={inputCls} />
                </Field>
                <Field label="클라이언트 (영어)" required>
                  <input type="text" value={data.client} onChange={(e) => set("client", e.target.value)} placeholder="Seoul City" className={inputCls} />
                </Field>
              </div>
              <Field label="건물 용도">
                <select value={data.useType} onChange={(e) => set("useType", e.target.value as ProjectFormData["useType"])} className={selectCls}>
                  <option value="">— 미설정 —</option>
                  {USE_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>{t.ko} ({t.en})</option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          {/* 2. 분류 */}
          <section>
            <h2 className="text-sm font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">분류</h2>
            <div className="space-y-4">
              <Field label="소속 회사 (복수 선택 가능)" required>
                <div className="flex gap-4 mt-1">
                  {(["ndb", "snp", "metalogic"] as const).map((co) => (
                    <label key={co} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.companies.includes(co)}
                        onChange={() => toggleCompany(co)}
                        className="w-4 h-4"
                      />
                      {co.toUpperCase()}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="노출">
                <div className="flex gap-4 mt-1">
                  {(["ndb", "snp", "metalogic", "nsm"] as const).map((co) => (
                    <label key={co} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.visibleOn.includes(co)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...data.visibleOn, co]
                            : data.visibleOn.filter((c) => c !== co)
                          set("visibleOn", next)
                        }}
                        className="w-4 h-4"
                      />
                      {co === "nsm" ? "NSM 홈" : co.toUpperCase()}
                    </label>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                {data.companies.includes("metalogic") && (
                  <Field label="Metalogic 카테고리">
                    <select value={data.metalogicCategory} onChange={(e) => set("metalogicCategory", e.target.value as ProjectFormData["metalogicCategory"])} className={selectCls}>
                      <option value="">— 미설정 —</option>
                      <option value="practice">Practice</option>
                      <option value="research">Logic / Research</option>
                      <option value="solution">Logic / Solutions</option>
                      <option value="essay">Insight / Essay</option>
                      <option value="education">Insight / Education</option>
                      <option value="roots">Insight / Roots</option>
                    </select>
                  </Field>
                )}
                {data.companies.includes("ndb") && (
                  <Field label="NDB 카테고리">
                    <select value={data.ndbCategory} onChange={(e) => set("ndbCategory", e.target.value as ProjectFormData["ndbCategory"])} className={selectCls}>
                      <option value="">— 미설정 —</option>
                      <option value="project">project</option>
                      <option value="research">research</option>
                    </select>
                  </Field>
                )}
                {data.companies.includes("snp") && (
                  <Field label="SNP 카테고리">
                    <select value={data.snpCategory} onChange={(e) => set("snpCategory", e.target.value as ProjectFormData["snpCategory"])} className={selectCls}>
                      <option value="">— 미설정 —</option>
                      <option value="project">project</option>
                      <option value="research">research</option>
                    </select>
                  </Field>
                )}
              </div>
            </div>
          </section>

          {/* 3. 이미지 + 콘텐츠 시퀀서 */}
          <section>
            <h2 className="text-sm font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">이미지 &amp; 콘텐츠</h2>
            <div className="space-y-4">
              {/* 드롭존 */}
              <div
                onDrop={(e) => { e.preventDefault(); const input = { target: { files: e.dataTransfer.files } } as any; handleImageFiles(input); }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.currentTarget.classList.add("border-gray-400", "bg-gray-50")}
                onDragLeave={(e) => e.currentTarget.classList.remove("border-gray-400", "bg-gray-50")}
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-400">이미지를 드래그하거나 클릭해서 선택</p>
                {uploadedFiles.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{uploadedFiles.length}개 로드됨</p>
                )}
                <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageFiles} />
              </div>
              {/* 시퀀서 */}
              <ImageSequencer
                uploadedFiles={uploadedFiles}
                blobUrls={previewBlobUrls}
                initialCoverImage={data.coverImage}
                initialContent={data.content}
                description={data.description}
                descriptionKo={data.descriptionKo}
                loadKey={loadKey}
                onCoverChange={(name) => set("coverImage", name)}
                onContentChange={(blocks) => set("content", blocks)}
                onDescriptionChange={(ko, en) => setData((prev) => ({ ...prev, descriptionKo: ko, description: en }))}
                onRemoveFile={(name) => setUploadedFiles((prev) => prev.filter((f) => f.name !== name))}
              />
            </div>
          </section>

          {/* 5. 추가 필드 */}
          <section>
            <h2 className="text-sm font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">추가 필드</h2>
            <div className="space-y-2">
              {Object.entries(data.extraFields).map(([k, v]) => (
                <div key={k} className="flex gap-2 items-center">
                  <input
                    value={k}
                    onChange={(e) => renameExtraField(k, e.target.value)}
                    placeholder="필드명"
                    className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                  <input
                    value={v}
                    onChange={(e) => set("extraFields", { ...data.extraFields, [k]: e.target.value })}
                    placeholder="값"
                    className={`${inputCls} flex-1`}
                  />
                  <button type="button" onClick={() => removeExtraField(k)} className="text-red-400 hover:text-red-600 px-2 text-lg leading-none">×</button>
                </div>
              ))}
              <button
                type="button"
                onClick={addExtraField}
                className="px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-gray-500"
              >
                + 필드 추가
              </button>
            </div>
          </section>

        </div>

        {/* MDX 미리보기 (우측 고정) */}
        <div className="w-full lg:w-[480px] xl:w-[560px] border-l border-gray-200 p-6 flex flex-col">
          <MdxPreview
            mdx={mdx}
            projectId={data.id}
            errors={validationErrors}
            existingProjects={existingProjects}
            projectsLoaded={projectsLoaded}
            projectsRefreshIn={projectsRefreshIn}
            onLoadProject={loadFromId}
            onDeleteProject={session ? async (id) => {
              const res = await fetch("/api/delete-project", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId: id }),
              });
              if (res.ok) {
                setExistingProjects((prev) => prev.filter((p) => p.id !== id));
              } else {
                alert("삭제 실패. 다시 시도해주세요.");
              }
            } : undefined}
          />
        </div>

      </div>

      {/* ── 불러오기 모달 ── */}
      {loadMode && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">기존 프로젝트 불러오기</h2>
              <button type="button" onClick={() => { setLoadMode(false); setLoadError(""); }} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
            </div>

            {/* 폴더 선택 (추천) */}
            <div
              onClick={() => folderInputRef.current?.click()}
              className="border-2 border-gray-900 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">📁 프로젝트 폴더 선택</p>
              <p className="text-xs text-gray-500 mt-1">MDX + 이미지를 한 번에 불러옵니다</p>
              <input
                ref={folderInputRef}
                type="file"
                // @ts-expect-error webkitdirectory is not in React types
                webkitdirectory=""
                onChange={handleFolder}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="flex-1 border-t border-gray-200" />
              또는 파일/텍스트로 불러오기
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* 단일 파일 or 텍스트 */}
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <p className="text-xs text-gray-500">.mdx 파일 드래그 또는 클릭해서 선택</p>
              <input ref={fileInputRef} type="file" accept=".mdx,.md,.txt" onChange={handleSingleFile} className="hidden" />
            </div>

            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={"---\nid: my-project\ntitle: ...\n---"}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            />

            {loadError && <p className="text-xs text-red-500">{loadError}</p>}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setLoadMode(false); setLoadError(""); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">취소</button>
              <button
                type="button"
                onClick={() => loadFromText(pasteText)}
                disabled={!pasteText.trim()}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40"
              >
                텍스트로 불러오기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

      {/* ── 등록 성공 오버레이 ── */}
      {publishStatus === "success" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-7 text-center space-y-4">
            <div className="text-3xl">✅</div>
            <h2 className="text-base font-semibold text-gray-900">GitHub에 등록되었습니다</h2>
            <p className="text-sm text-gray-500">Vercel이 자동으로 빌드를 시작했습니다.</p>

            {countdown > 0 ? (
              <div className="text-sm text-gray-400">
                약 <span className="font-mono font-semibold text-gray-700">{countdown}초</span> 후 홈페이지에 반영됩니다
              </div>
            ) : (
              <p className="text-sm text-green-600 font-medium">빌드가 완료되었을 수 있습니다.</p>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-2.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                홈페이지 확인하기 {countdown > 0 && <span className="text-gray-400 text-xs">(빌드 전일 수 있음)</span>}
              </a>
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                Vercel 대시보드 확인
              </a>
              <button
                type="button"
                onClick={() => setPublishStatus("idle")}
                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 mt-1"
              >
                계속 편집
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 등록 에러 배너 ── */}
      {publishStatus === "error" && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 rounded-lg px-5 py-3 flex items-center gap-3 shadow-lg z-50">
          <span className="text-sm text-red-700">등록 실패: {publishError}</span>
          <button type="button" onClick={() => setPublishStatus("idle")} className="text-xs text-red-500 hover:text-red-700">닫기</button>
        </div>
      )}

    </>
  );
}
