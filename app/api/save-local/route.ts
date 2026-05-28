import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);
const PROJECT_ROOT = process.cwd();

export async function GET() {
  try {
    await execAsync("git --version", { cwd: PROJECT_ROOT });
    return NextResponse.json({ available: true });
  } catch {
    return NextResponse.json({ available: false });
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const projectId = formData.get("projectId") as string;
  const mdxContent = formData.get("mdxContent") as string;

  if (!projectId || !mdxContent) {
    return NextResponse.json({ error: "projectId, mdxContent 필요" }, { status: 400 });
  }

  try {
    await execAsync("git pull", { cwd: PROJECT_ROOT });
  } catch (e: any) {
    return NextResponse.json({ error: `git pull 실패: ${e.message}` }, { status: 500 });
  }

  const dir = path.join(PROJECT_ROOT, "public", "projects", projectId);

  // 이번 저장에 포함될 파일 이름 목록 (클라이언트가 보내준 keepFiles)
  const keepFilesStr = formData.get("keepFiles");
  const keepFiles = keepFilesStr
    ? new Set<string>(JSON.parse(keepFilesStr as string))
    : null;

  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${projectId}.mdx`), mdxContent, "utf-8");

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image:") && value instanceof File) {
        const filename = key.slice("image:".length);
        const buffer = Buffer.from(await value.arrayBuffer());
        await fs.writeFile(path.join(dir, filename), buffer);
      }
    }

    // keepFiles 목록이 있으면, 디렉터리의 기존 이미지 중 목록에 없는 것 삭제
    if (keepFiles) {
      const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg"]);
      const existing = await fs.readdir(dir);
      await Promise.all(
        existing.map(async (file) => {
          if (file === `${projectId}.mdx`) return; // MDX는 절대 삭제 안 함
          const ext = file.split(".").pop()?.toLowerCase() ?? "";
          if (IMAGE_EXTS.has(ext) && !keepFiles.has(file)) {
            await fs.unlink(path.join(dir, file));
          }
        })
      );
    }
  } catch (e: any) {
    return NextResponse.json({ error: `파일 저장 실패: ${e.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, path: dir });
}
