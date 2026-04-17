import { Project } from '@/types/project';
import { getImgPath } from '@/lib/utils';

const ID = "snp-bach-house";

export const snpBachHouse: Project = {
  id: ID,
  title: "Bach House",
  titleKo: "반포캐슬 바흐하우스",
  location: "Seoul, Korea",
  locationKo: "서울, 한국",
  year: "2024",
  status: "completed",
  client: "Daejeon City",
  clientKo: "서울 ",
  area: "7,844 m²",
  use: "Museum / Gallery",
  useKo: "주거복합",
  image: getImgPath(ID, "01-exterior.png"),
  images: [
    getImgPath(ID, "01-exterior.png"),
    getImgPath(ID, "02-interior.png"),
    getImgPath(ID, "03-aerial.png")
  ],
  content: [
    {
      type: "image",
      src: getImgPath(ID, "01-exterior.png"),
      alt: "Exterior",
    },
    {
      type: "image",
      src: getImgPath(ID, "01b-facade.png"),
      alt: "Facade",
    },
    {
      type: "text",
      title: { ko: "임대 주거의 새로운 전형(Typology) 탐구.", en: "Bach House" },
      body: {
        ko: "민간 임대 주거 공간이 지녀야 할 새로운 스탠다드를 제안하고자 했다. 기존 임대 주택의 획일화된 문법에서 벗어나, 하이엔드 주거가 갖추어야 할 본질적인 가치를 건축적으로 구현하는 데 집중했다. 단순한 주거 공급을 넘어 도시의 맥락 안에서 영속성을 갖는 건축물을 목표로 삼았다.",
        en: "Exploring a new typology for rental housing. We aimed to propose a higher standard for private rental living by moving beyond uniform conventions and focusing on the essential values of high-end residential architecture.",
      },
    },
    {
      type: "image",
      src: getImgPath(ID, "02-interior.png"),
      alt: "Interior",
    },
    {
      type: "text",
      title: { ko: "물성과 디테일", en: "Material & Detail" },
      body: {
        ko: "외피의 구축: 건축물의 첫인상을 결정짓는 외벽 마감재로 스페인산 라임스톤(팔로마)을 선택했다. 천연석 특유의 질감을 통해 시간의 흐름에 대응하는 무게감을 부여했으며, 외단열 공법과 정교한 디테일을 결합해 시공 효율과 미적 완성도를 동시에 확보했다.\n\n에너지와 환경의 통합: 심미적 가치만큼이나 건축물의 기능적 성능에 주력했다. 3중 유리를 채택하여 단열 성능을 극대화하고 옥상층에 태양광 발전 시스템을 통합 설계했다. 이를 통해 녹색건축인증 및 건축물 에너지효율등급 인증을 획득하며 환경 부하를 최소화하는 지속 가능한 건축을 실현했다.\n\n거주 편의를 위한 공간 기획: 대지의 제약 조건 안에서 법정 기준 대비 141%의 주차 공간(세대당 1.5대)을 확보하는 데 설계 역량을 집중했다. 이는 주택의 물리적 가치뿐만 아니라 실제 거주자의 삶의 질을 결정짓는 핵심 요소라는 판단에 기인했다.\n",
        en: "- Envelope: Spanish limestone was selected to provide a lasting, time-responsive presence.\n- Energy & Environment: Triple glazing and integrated solar systems improved performance and sustainability.\n- Livability: Parking capacity was planned above the legal baseline to support daily convenience.",
      },
    },
    {
      type: "image",
      src: getImgPath(ID, "03-aerial.png"),
      alt: "Aerial",
    },
    {
      type: "text",
      title: { ko: "설계 철학의 투영", en: "Design Philosophy" },
      body: {
        ko: "조망권 확보를 위한 매스 분절과 한샘과의 협업을 통한 내부 시스템의 통합은 건축과 인테리어가 분리되지 않는 하나의 완성된 환경을 만들기 위한 과정이었다. 건축주가 요구한 고급 주택의 니즈를 충족시키는 것을 넘어, 보이지 않는 기술적 요소와 거주자의 편의를 설계의 중심에 두고자 노력했다. 본 프로젝트는 임대 형태의 주거 공간도 충분히 높은 건축적 완성도를 지닐 수 있음을 증명하기 위한 기록이다.",
        en: "Mass articulation to secure views and the integrated interior system developed with Hanssem were part of creating a cohesive environment where architecture and interior design are inseparable. Beyond meeting the client’s requirements for a high-end home, we focused on the invisible technical elements and everyday comfort. This project documents our belief that rental housing can also achieve a high level of architectural completeness.",
      },
    },
  ],
  description: "A museum exploring the harmony of light and space. Natural light organically connects the exhibition spaces.",
  descriptionKo: "임대 주거의 새로운 전형(Typology) 탐구...", 
  companies: ["ndb", "snp"],
  featured: true,
  showOnHome: true,
};