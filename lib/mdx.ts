import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Project } from '@/types/project';

const PROJECTS_DIR = path.join(process.cwd(), 'public/projects');

function resolveImgPath(projectId: string, src: string): string {
  if (!src || src.startsWith('http')) return src ?? '';
  return `/projects/${projectId}/${src}`;
}

export function getAllProjects(): Project[] {
  const dirs = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory());

  return dirs.flatMap(dir => {
    const dirPath = path.join(PROJECTS_DIR, dir.name);
    const mdxFile = fs.readdirSync(dirPath).find(f => f.endsWith('.mdx'));
    if (!mdxFile) return [];

    const raw = fs.readFileSync(path.join(dirPath, mdxFile), 'utf-8');
    const { data } = matter(raw);
    const id = data.id as string;

    return [{
      id,
      title: data.title,
      titleKo: data.titleKo,
      category: data.category,
      location: data.location,
      locationKo: data.locationKo,
      year: String(data.year),
      status: data.status,
      client: data.client,
      clientKo: data.clientKo,
      area: data.area ?? '-',
      use: data.use ?? '-',
      useKo: data.useKo ?? '-',
      description: data.description ?? 'To be updated',
      descriptionKo: data.descriptionKo ?? 'To be updated',
      companies: data.companies,
      metalogicCategory: data.metalogicCategory,
      featured: data.featured,
      showOnHome: data.showOnHome,
      image: resolveImgPath(id, data.coverImage),
      images: (data.images ?? []).map((f: string) => resolveImgPath(id, f)),
      content: (data.content ?? []).map((block: any) =>
        block.type === 'image'
          ? { type: 'image' as const, src: resolveImgPath(id, block.src), alt: block.alt }
          : {
              type: 'text' as const,
              title: { ko: block.titleKo ?? '', en: block.titleEn ?? '' },
              body: { ko: block.bodyKo ?? '', en: block.bodyEn ?? '' },
            }
      ),
    } as Project];
  });
}
