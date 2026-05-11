import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export async function GET() {
  const projectsDir = path.join(process.cwd(), "public", "projects");
  try {
    const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
    const projects = entries
      .filter((e) => e.isDirectory())
      .map((e) => {
        const id = e.name;
        const mdxPath = path.join(projectsDir, id, `${id}.mdx`);
        try {
          const raw = fs.readFileSync(mdxPath, "utf-8");
          const { data } = matter(raw);
          return { id, title: data.title ?? id, titleKo: data.titleKo ?? "" };
        } catch {
          return { id, title: id, titleKo: "" };
        }
      })
      .sort((a, b) => a.id.localeCompare(b.id));
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json([]);
  }
}
