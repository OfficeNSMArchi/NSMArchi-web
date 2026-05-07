import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export async function GET() {
  const projectsDir = path.join(process.cwd(), "public", "projects");
  try {
    const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
    const keyCounts: Record<string, number> = {};
    let total = 0;

    for (const entry of entries.filter((e) => e.isDirectory())) {
      const mdxPath = path.join(projectsDir, entry.name, `${entry.name}.mdx`);
      try {
        const raw = fs.readFileSync(mdxPath, "utf-8");
        const { data } = matter(raw);
        total++;
        for (const key of Object.keys(data)) {
          keyCounts[key] = (keyCounts[key] ?? 0) + 1;
        }
      } catch {}
    }

    const result = Object.entries(keyCounts)
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ fields: result, total });
  } catch {
    return NextResponse.json({ fields: [], total: 0 });
  }
}
