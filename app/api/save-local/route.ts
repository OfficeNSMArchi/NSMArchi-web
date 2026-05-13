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
  } catch (e: any) {
    return NextResponse.json({ error: `파일 저장 실패: ${e.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, path: dir });
}
