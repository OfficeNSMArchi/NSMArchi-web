// 파일 위치: data/projects/index.ts
import { Project } from '@/types/project';

// NDB
import { ndbLhBimResearch } from './ndb/ndb-lh-bim-research';
import { ndbCultural } from './ndb/ndb-cultural';
import { ndbResidence } from './ndb/ndb-residence';

// SNP
import { snpBachHouse } from './snp/snp-bach-house';
import { snpYeonhariHouse } from './snp/snp-yeonhari-house';
import { snpSchool } from './snp/snp-school';

// META LOGIC
import { mlPajuWelfare } from './metalogic/ml-paju-welfare';
import { mlLutonCresta } from './metalogic/ml-luton-cresta';
import { mlFactory } from './metalogic/ml-factory';
import { mlHknuFundamentalDesign } from './metalogic/ml-hknu-fundamental-design';
import { mlHknuPavilion } from './metalogic/ml-hknu-pavilion';

// NSM (Joint)
import { nsmGaebongWelfare } from './nsm/nsm-gaebong-welfare';
import { nsmBuamComplex } from './nsm/nsm-buam-complex';
import { nsmResort } from './nsm/nsm-resort';

// 전체 배열 내보내기
export const allProjects: Project[] = [
  ndbLhBimResearch,
  ndbCultural,
  ndbResidence,
  snpBachHouse,
  snpYeonhariHouse,
  snpSchool,
  mlPajuWelfare,
  mlLutonCresta,
  mlFactory,
  mlHknuFundamentalDesign,
  mlHknuPavilion,
  nsmGaebongWelfare,
  nsmBuamComplex,
  nsmResort,
];