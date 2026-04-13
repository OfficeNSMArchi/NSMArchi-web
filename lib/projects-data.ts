// 파일 위치: (기존) projects-data.ts 파일 덮어쓰기

// 새 집(data 폴더)에서 데이터를 가져옵니다.
import { allProjects } from '@/data/projects/index';
import { companies as allCompanies } from '@/data/companies';

// 옛날 UI 파일들이 찾던 이름(projects, companies) 그대로 내보냅니다.
export const projects = allProjects;
export const companies = allCompanies;