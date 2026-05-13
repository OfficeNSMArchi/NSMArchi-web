import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const PROJECT_ROOT = process.cwd();

export async function POST() {
  try {
    await execAsync("git add .", { cwd: PROJECT_ROOT });

    const { stdout: statusOut } = await execAsync("git status --porcelain", { cwd: PROJECT_ROOT });
    if (!statusOut.trim()) {
      return NextResponse.json({ ok: true, message: "변경사항 없음" });
    }

    // 변경 파일 요약
    const lines = statusOut.trim().split("\n");
    const summary = lines.map((line) => {
      const flag = line.slice(0, 2).trim();
      const file = line.slice(3).trim();
      // public/projects/{id}/... 에서 id만 추출
      const match = file.match(/public\/projects\/([^/]+)/);
      const label = match ? match[1] : file;
      return flag === "?" || flag === "A" ? `${label} 추가` : `${label} 수정`;
    });
    const uniqueSummary = [...new Set(summary)];

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const commitMessage = `폼에서 입력 및 푸시 (${timestamp})\n\n${uniqueSummary.join("\n")}`;

    await execAsync(`git commit -m "${commitMessage}"`, { cwd: PROJECT_ROOT });
    await execAsync("git push", { cwd: PROJECT_ROOT });

    return NextResponse.json({ ok: true, summary: uniqueSummary });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
