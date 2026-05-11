import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Octokit } from "@octokit/rest";

const ALLOWED_EMAIL = "office@nsmarchi.com";

interface ImageFile {
  filename: string;
  base64: string;
}

interface PublishPayload {
  projectId: string;
  mdxContent: string;
  images: ImageFile[];
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.email !== ALLOWED_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload: PublishPayload = await req.json();
  const { projectId, mdxContent, images } = payload;

  if (!projectId || !mdxContent) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const basePath = `public/projects/${projectId}`;

  try {
    // Get the latest commit SHA for the base branch
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: "heads/main",
    });
    const latestCommitSha = refData.object.sha;

    // Get the tree SHA of the latest commit
    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha,
    });
    const baseTreeSha = commitData.tree.sha;

    // Build tree entries: MDX + all images
    const treeItems: { path: string; mode: "100644"; type: "blob"; content?: string; sha?: string }[] = [];

    // MDX file (text content)
    treeItems.push({
      path: `${basePath}/${projectId}.mdx`,
      mode: "100644",
      type: "blob",
      content: mdxContent,
    });

    // Image files (binary via blob API)
    for (const image of images) {
      const { data: blobData } = await octokit.git.createBlob({
        owner,
        repo,
        content: image.base64,
        encoding: "base64",
      });

      treeItems.push({
        path: `${basePath}/${image.filename}`,
        mode: "100644",
        type: "blob",
        sha: blobData.sha,
      });
    }

    // Create a new tree
    const { data: newTree } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: treeItems,
    });

    // Create the commit
    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: `프로젝트 등록: ${projectId}`,
      tree: newTree.sha,
      parents: [latestCommitSha],
    });

    // Update the branch ref
    await octokit.git.updateRef({
      owner,
      repo,
      ref: "heads/main",
      sha: newCommit.sha,
    });

    return NextResponse.json({ success: true, commitSha: newCommit.sha });
  } catch (error: any) {
    console.error("GitHub commit error:", error);
    return NextResponse.json(
      { error: error.message || "GitHub commit failed" },
      { status: 500 }
    );
  }
}
