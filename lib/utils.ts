import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind CSS 클래스 합치기 유틸리티
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 프로젝트 ID와 파일명을 기반으로 이미지 경로를 생성하는 유틸리티
 * @param id - 프로젝트 ID (예: 'ml-hknu-pavilion', 'snp-museum')
 * @param fileName - 이미지 파일명 (예: 'COVER.jpg')
 * @returns public 폴더 기준의 이미지 경로 스트링
 */
export function getImgPath(id: string, fileName: string): string {
  // ID의 첫 번째 파트(회사 접두어) 추출
  const prefix = id.split('-')[0].toLowerCase();
  
  let companyFolder = '';

  // 접두어에 따른 상위 폴더 매핑
  switch (prefix) {
    case 'ml':
      companyFolder = 'metalogic';
      break;
    case 'ndb':
      companyFolder = 'ndb';
      break;
    case 'snp':
      companyFolder = 'snp';
      break;
    case 'nsm':
      companyFolder = 'nsm';
      break;
    default:
      // 예외 케이스: 접두어가 없거나 매칭되지 않을 경우 일반 프로젝트 폴더로 지정
      return `/projects/${id}/${fileName}`;
  }

  // 최종 경로 반환: /projects/회사폴더/프로젝트ID/파일명
  return `/projects/${companyFolder}/${id}/${fileName}`;
}