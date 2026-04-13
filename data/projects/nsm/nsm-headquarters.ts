import { Project } from '@/types/project';
import { getImgPath } from '@/lib/utils';

const ID = "nsm-headquarters";

export const nsmHeadquarters: Project = {
  id: ID,
  title: "Gaebong-dong Comprehensive Social Welfare Center (Competition)",
  titleKo: "서울시 개봉동 종합사회복지관 건립 설계",
  location: "Seoul, Korea",
  locationKo: "서울, 한국",
  year: "2025",
  status: "completed",
  client: "N+S+M",
  clientKo: "N+S+M",
  area: "-",
  use: "-",
  useKo: "-",
  image: getImgPath(ID, "cover.png"),
  description: "To be updated",
  descriptionKo: "To be updated",
  companies: ["ndb", "snp"],
  featured: true,
  showOnHome: true,
};