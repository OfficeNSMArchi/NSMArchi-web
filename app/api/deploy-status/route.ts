import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function GET(req: NextRequest) {
  const commitSha = req.nextUrl.searchParams.get("commitSha");
  if (!commitSha) {
    return NextResponse.json({ state: "unknown", error: "commitSha required" }, { status: 400 });
  }

  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;

    const { data } = await octokit.repos.getCombinedStatusForRef({
      owner,
      repo,
      ref: commitSha,
    });

    // Vercel posts a commit status with a context like "vercel" or "Vercel"
    const vercelStatus = data.statuses.find(
      (s) => s.context?.toLowerCase().includes("vercel")
    );

    return NextResponse.json({
      state: data.state, // "pending" | "success" | "failure"
      vercel: vercelStatus
        ? {
            state: vercelStatus.state,
            description: vercelStatus.description,
            targetUrl: vercelStatus.target_url,
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { state: "unknown", error: error.message },
      { status: 500 }
    );
  }
}
