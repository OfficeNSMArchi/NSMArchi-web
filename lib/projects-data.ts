export interface Project {
  id: string
  title: string
  titleKo: string
  category?: "design" | "research"
  location: string
  locationKo: string
  year: string
  status: "completed" | "in-progress" | "planning"
  client: string
  clientKo: string
  area: string // 연면적
  use: string // 용도
  useKo: string // 용도 한글
  image: string
  images?: string[]
  description: string
  descriptionKo: string
  content?: Array<
    | { type: "image"; src: string; alt?: string }
    | { type: "text"; title?: { ko: string; en: string }; body: { ko: string; en: string } }
  >
  companies: Array<"ndb" | "snp" | "metalogic">
  featured?: boolean
  showOnHome?: boolean
}

export const projects: Project[] = [
  // NDB Projects
  {
    id: "ndb-tower",
    title: "LH BIM Cloud User Manual Research",
    titleKo: "LH BIM 클라우드 사용 매뉴얼 연구",
    category: "research",
    location: "Seoul, Korea",
    locationKo: "서울, 한국",
    year: "2025",
    status: "completed",
    client: "NDB Corporation",
    clientKo: "NDB 주식회사",
    area: "-",
    use: "-",
    useKo: "-",
    image: "/projects/lh-bim-cloud/cover.png",
    description: "To be updated",
    descriptionKo: "To be updated",
    companies: ["ndb"],
    featured: true,
    showOnHome: true,
  },
  {
    id: "ndb-cultural",
    title: "Cultural Complex",
    titleKo: "문화복합센터",
    location: "Busan, Korea",
    locationKo: "부산, 한국",
    year: "2023",
    status: "completed",
    client: "Busan Metropolitan City",
    clientKo: "부산광역시",
    area: "-",
    use: "-",
    useKo: "-",
    image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=600&fit=crop",
    description: "To be updated",
    descriptionKo: "To be updated",
    companies: ["ndb"],
  },
  {
    id: "ndb-residence",
    title: "Riverside Residence",
    titleKo: "리버사이드 레지던스",
    location: "Incheon, Korea",
    locationKo: "인천, 한국",
    year: "2025",
    status: "in-progress",
    client: "Private",
    clientKo: "개인",
    area: "-",
    use: "-",
    useKo: "-",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    description: "To be updated",
    descriptionKo: "To be updated",
    companies: ["ndb"],
  },

  // SNP Projects
  {
    id: "snp-museum",
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
    image: "/projects/banpo/01-exterior.png",
    images: [
      "/projects/banpo/01-exterior.png",
      "/projects/banpo/02-interior.png",
      "/projects/banpo/03-aerial.png"
    ],
    content: [
      {
        type: "image",
        src: "/projects/banpo/01-exterior.png",
        alt: "Exterior",
      },
      {
        type: "image",
        src: "/projects/banpo/01b-facade.png",
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
        src: "/projects/banpo/02-interior.png",
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
        src: "/projects/banpo/03-aerial.png",
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
    descriptionKo: "임대 주거의 새로운 전형(Typology) 탐구.\n민간 임대 주거 공간이 지녀야 할 새로운 스탠다드를 제안하고자 했다. 기존 임대 주택의 획일화된 문법에서 벗어나, 하이엔드 주거가 갖추어야 할 본질적인 가치를 건축적으로 구현하는 데 집중했다. 단순한 주거 공급을 넘어 도시의 맥락 안에서 영속성을 갖는 건축물을 목표로 삼았다.\n\n물성과 디테일에 대한 고민\n- 외피의 구축: 건축물의 첫인상을 결정짓는 외벽 마감재로 스페인산 라임스톤(팔로마)을 선택했다. 천연석 특유의 질감을 통해 시간의 흐름에 대응하는 무게감을 부여했으며, 외단열 공법과 정교한 디테일을 결합해 시공 효율과 미적 완성도를 동시에 확보했다.\n\n- 에너지와 환경의 통합: 심미적 가치만큼이나 건축물의 기능적 성능에 주력했다. 3중 유리를 채택하여 단열 성능을 극대화하고 옥상층에 태양광 발전 시스템을 통합 설계했다. 이를 통해 녹색건축인증 및 건축물 에너지효율등급 인증을 획득하며 환경 부하를 최소화하는 지속 가능한 건축을 실현했다.\n\n- 거주 편의를 위한 공간 기획: 대지의 제약 조건 안에서 법정 기준 대비 141%의 주차 공간(세대당 1.5대)을 확보하는 데 설계 역량을 집중했다. 이는 주택의 물리적 가치뿐만 아니라 실제 거주자의 삶의 질을 결정짓는 핵심 요소라는 판단에 기인했다.\n\n설계 철학의 투영\n조망권 확보를 위한 매스 분절과 한샘과의 협업을 통한 내부 시스템의 통합은 건축과 인테리어가 분리되지 않는 하나의 완성된 환경을 만들기 위한 과정이었다. 건축주가 요구한 고급 주택의 니즈를 충족시키는 것을 넘어, 보이지 않는 기술적 요소와 거주자의 편의를 설계의 중심에 두고자 노력했다. 본 프로젝트는 임대 형태의 주거 공간도 충분히 높은 건축적 완성도를 지닐 수 있음을 증명하기 위한 기록이다.",
    companies: ["ndb", "snp"],
    featured: true,
    showOnHome: true,
  },
  {
    id: "snp-library",
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
    image: "/projects/yeonhari/cover.png",
    description: "To be updated",
    descriptionKo: "To be updated",
    companies: ["snp"],
    showOnHome: true,
  },
  {
    id: "snp-school",
    title: "Future School",
    titleKo: "미래학교",
    location: "Gwangju, Korea",
    locationKo: "광주, 한국",
    year: "2026",
    status: "planning",
    client: "Ministry of Education",
    clientKo: "교육부",
    area: "-",
    use: "-",
    useKo: "-",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop",
    description: "To be updated",
    descriptionKo: "To be updated",
    companies: ["snp"],
  },

  // META LOGIC Projects
  {
    id: "ml-datacenter",
    title: "Paju Unjeong-dong 6 Administrative Welfare Center",
    titleKo: "파주 운정 6동 행정복지센터",
    location: "Paju, Korea",
    locationKo: "파주, 한국",
    year: "2024",
    status: "completed",
    client: "Tech Corp",
    clientKo: "테크 코퍼레이션",
    area: "-",
    use: "-",
    useKo: "-",
    image: "/projects/pajuunjung/cover.png",
    description: "To be updated",
    descriptionKo: "To be updated",
    companies: ["metalogic"],
    featured: true,
    showOnHome: true,
  },
  {
    id: "ml-logistics",
    title: "Luton Cresta House",
    titleKo: "루튼 크레스타 하우스",
    location: "Luton, United Kingdom",
    locationKo: "루튼, 영국",
    year: "2021",
    status: "completed",
    client: "Logistics Koreanp",
    clientKo: "로지스틱스 코리아",
    area: "-",
    use: "-",
    useKo: "-",
    image: "/projects/lutonCreasta/cover.png",
    description: "To be updated",
    descriptionKo: "To be updated",
    companies: ["metalogic"],
    showOnHome: true,
  },
  {
    id: "ml-factory",
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
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop",
    description: "To be updated",
    descriptionKo: "To be updated",
    companies: ["metalogic"],
  },

  // Joint Projects (NSM)
  {
    id: "nsm-headquarters",
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
    image: "/projects/gaebongdong/cover.png",
    description: "To be updated",
    descriptionKo: "To be updated",
    companies: ["ndb", "snp"],
    featured: true,
    showOnHome: true,
  },
  {
    id: "nsm-masterplan",
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
    image: "/projects/buamdong/cover.png",
    description: "To be updated",
    descriptionKo: "To be updated",
    companies: ["ndb", "snp", "metalogic"],
    featured: true,
    showOnHome: true,
  },
  {
    id: "nsm-resort",
    title: "Eco Resort",
    titleKo: "에코 리조트",
    location: "Jeju, Korea",
    locationKo: "제주, 한국",
    year: "2025",
    status: "in-progress",
    client: "Resort Development",
    clientKo: "리조트 개발사",
    area: "-",
    use: "-",
    useKo: "-",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
    description: "To be updated",
    descriptionKo: "To be updated",
    companies: ["ndb", "snp", "metalogic"],
  },
]

export const companies = {
  ndb: {
    name: "NDB",
    fullName: "NDB Architecture",
    description:
      "도시와 건축의 새로운 가능성을 탐구합니다. 지속 가능한 미래를 위한 혁신적인 설계 솔루션을 제공합니다.",
    descriptionEn:
      "We explore new possibilities in city and architecture, delivering innovative design solutions for a sustainable future.",
    founded: "2010",
    location: "Seoul, Korea",
    expertise: ["Commercial", "Residential", "Cultural"],
  },
  snp: {
    name: "SNP",
    fullName: "SNP Design Studio",
    description:
      "공간과 사람의 관계를 디자인합니다. 커뮤니티 중심의 건축으로 더 나은 삶을 만들어갑니다.",
    descriptionEn:
      "We design the relationship between space and people, creating better lives through community‑focused architecture.",
    founded: "2012",
    location: "Seoul, Korea",
    expertise: ["Cultural", "Education", "Public"],
  },
  metalogic: {
    name: "META LOGIC",
    fullName: "META LOGIC",
    description: "To be updated",
    descriptionEn: "To be updated",
    founded: "2015",
    location: "Pangyo, Korea",
    expertise: ["Industrial", "Data Center", "Logistics"],
  },
}
