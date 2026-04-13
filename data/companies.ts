// 파일 위치: data/companies.ts

import { CompanyInfo } from '@/types/project';

export const companies: Record<string, CompanyInfo> = {
  ndb: {
    name: "NDB",
    fullName: "NDB Architecture",
    description: "도시와 건축의 새로운 가능성을 탐구합니다. 지속 가능한 미래를 위한 혁신적인 설계 솔루션을 제공합니다.",
    descriptionEn: "We explore new possibilities in city and architecture, delivering innovative design solutions for a sustainable future.",
    founded: "2010",
    location: "Seoul, Korea",
    expertise: ["Commercial", "Residential", "Cultural"],
  },
  snp: {
    name: "SNP",
    fullName: "SNP Design Studio",
    description: "공간과 사람의 관계를 디자인합니다. 커뮤니티 중심의 건축으로 더 나은 삶을 만들어갑니다.",
    descriptionEn: "We design the relationship between space and people, creating better lives through community-centric architecture.",
    founded: "2015",
    location: "Seoul, Korea",
    expertise: ["Public", "Educational", "Urban"],
  }
};