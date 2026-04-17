import { Project } from '@/types/project';
import { getImgPath } from '@/lib/utils';

const ID = "snp-yeonhari-house";

export const snpYeonhariHouse: Project = {
  id: ID,
  title: "Gapyeong Yeonhari Single-family House",
  titleKo: "가평군 상면 연하리 단독주택",
  location: "Gapyeong, Korea",
  locationKo: "가평, 한국",
  year: "2021",
  status: "completed",
  client: "Sejong City",
  clientKo: "세종시",
  area: "-",
  use: "-",
  useKo: "-",
  image: getImgPath(ID, "cover.png"),
  description: "To be updated",
  descriptionKo: "To be updated",
  companies: ["snp"],
  showOnHome: true,
};