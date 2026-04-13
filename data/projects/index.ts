// 파일 위치: data/projects/index.ts
import { Project } from '@/types/project';

// NDB
import { ndbTower } from './ndb/ndb-tower';
import { ndbCultural } from './ndb/ndb-cultural';
import { ndbResidence } from './ndb/ndb-residence';

// SNP
import { snpMuseum } from './snp/snp-museum';
import { snpLibrary } from './snp/snp-library';
import { snpSchool } from './snp/snp-school';

// META LOGIC
import { mlDatacenter } from './metalogic/ml-datacenter';
import { mlLogistics } from './metalogic/ml-logistics';
import { mlFactory } from './metalogic/ml-factory';
import { mlHknuFundamentalDesign } from './metalogic/ml-hknu-fundamental-design';
import { mlHknuPavilion } from './metalogic/ml-hknu-pavilion';

// NSM (Joint)
import { nsmHeadquarters } from './nsm/nsm-headquarters';
import { nsmMasterplan } from './nsm/nsm-masterplan';
import { nsmResort } from './nsm/nsm-resort';

// 전체 배열 내보내기
export const allProjects: Project[] = [
  ndbTower,
  ndbCultural,
  ndbResidence,
  snpMuseum,
  snpLibrary,
  snpSchool,
  mlDatacenter,
  mlLogistics,
  mlFactory,
  mlHknuFundamentalDesign,
  mlHknuPavilion,
  nsmHeadquarters,
  nsmMasterplan,
  nsmResort,
];