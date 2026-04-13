// data/projects/metalogic/ml-datacenter.ts
import { Project } from '@/types/project';
import { getImgPath } from '@/lib/utils';

const ID = "ml-datacenter";

export const mlDatacenter: Project = {
  id: ID,
  title: "Paju Unjeong-dong 6 Administrative Welfare Center",
  titleKo: "파주 운정 6동 행정복지센터",
  location: "Paju, Korea",
  locationKo: "파주, 한국",
  year: "2024",
  status: "completed",
  client: "Tech Corp",
  clientKo: "테크 코퍼레이션",
  area: "-",
  use: "-",
  useKo: "-",
  image: getImgPath(ID, "cover.png"),
  description: "To be updated",
  descriptionKo: "To be updated",
  companies: ["metalogic"],
  metalogicCategory: "practice",
  featured: true,
  showOnHome: true,
};