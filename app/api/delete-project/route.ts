import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Octokit } from "@octokit/rest";

const ALLOWED_EMAIL = "office@nsmarchi.com";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.email !== ALLOWED_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { projectId } = await req.json();
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const folderPath = `public/projects/${projectId}`;

  try {
    const { data: refData } = await octokit.git.getRef({ owner, repo, ref: "heads/main" });
    const latestCommitSha = refData.object.sha;

    const { data: commitData } = await octokit.git.getCommit({ owner, repo, commit_sha: latestCommitSha });
    const baseTreeSha = commitData.tree.sha;

    // 전체 트리에서 해당 폴더 파일 제외
    const { data: treeData } = await octokit.git.getTree({ owner, repo, tree_sha: baseTreeSha, recursive: "1" });

    const filteredTree = treeData.tree
      .filter((item) => item.type === "blob" && item.path && !item.path.startsWith(folderPath + "/"))
      .map(({ path, sha }) => ({ path: path!, mode: "100644" as const, type: "blob" as const, sha: sha! }));

    const { data: newTree } = await octokit.git.createTree({ owner, repo, tree: filteredTree });

    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: `프로젝트 삭제: ${projectId}`,
      tree: newTree.sha,
      parents: [latestCommitSha],
    });

    await octokit.git.updateRef({ owner, repo, ref: "heads/main", sha: newCommit.sha });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("GitHub delete error:", error);
    return NextResponse.json({ error: error.message || "삭제 실패" }, { status: 500 });
  }
}
