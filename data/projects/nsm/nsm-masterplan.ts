import { Project } from '@/types/project';
import { getImgPath } from '@/lib/utils';

const ID = "nsm-masterplan";

export const nsmMasterplan: Project = {
  id: ID,
  title: "Buam-dong Public Parking & Community Complex",
  titleKo: "서울시 부암동 공영주차장 및 주민복합시설",
  location: "Seoul, Korea",
  locationKo: "서울, 한국",
  year: "2026",
  status: "planning",
  client: "Incheon Metropolitan City",
  clientKo: "인천광역시",
  area: "-",
  use: "-",
  useKo: "-",
  // 기존 하드코딩된 경로 대신 ID 상수를 사용하여 동적으로 경로 생성
  image: getImgPath(ID, "cover.png"),
  description: "To be updated",
  descriptionKo: "To be updated",
  companies: ["ndb", "snp", "metalogic"],
  metalogicCategory: "practice",
  featured: true,
  showOnHome: true,
};