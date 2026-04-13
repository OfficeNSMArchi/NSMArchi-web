// data/projects/metalogic/ml-factory.ts
import { Project } from '@/types/project';

const ID = "ml-factory";

export const mlFactory: Project = {
  id: ID,
  title: "Smart Factory",
  titleKo: "스마트 팩토리",
  location: "Ulsan, Korea",
  locationKo: "울산, 한국",
  year: "2025",
  status: "in-progress",
  client: "Manufacturing Inc.",
  clientKo: "매뉴팩처링 주식회사",
  area: "-",
  use: "-",
  useKo: "-",
  // 외부 링크이므로 getImgPath를 쓰지 않고 그대로 유지합니다.
  image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop",
  description: "To be updated",
  descriptionKo: "To be updated",
  companies: ["metalogic"],
  metalogicCategory: "practice",
};