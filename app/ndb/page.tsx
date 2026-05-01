"use client"

import React from 'react';
import { Building2, Layout, Box, PenTool, Phone, MapPin, Mail } from 'lucide-react';
import { NsmHomeCorner } from '@/components/nsm-home-corner';
import { allProjects } from "@/data/projects/index"
import { ProjectZoomGallery } from "@/components/project-zoom-gallery"

const ndbProjects = allProjects.filter(p => p.companies.includes("ndb"));

export default function Page() {
  // 서비스 데이터 [cite: 41, 44, 47, 49]
  const services = [
    {
      title: "BIM 설계지원", // [cite: 41]
      description: "현상설계, 기본/실시설계 도서작성 및 간섭체크를 지원합니다.", // [cite: 42, 43]
      icon: <Layout className="w-6 h-6" />
    },
    {
      title: "BIM 코디네이션", // [cite: 44]
      description: "업무 프로세스 개선 및 설계오류 검토를 통한 품질을 확보합니다.", // [cite: 46]
      icon: <Box className="w-6 h-6" />
    },
    {
      title: "시각화 지원", // [cite: 47]
      description: "첨단 디지털 기술을 활용한 혁신적인 계획 프로세스를 제시합니다.", // [cite: 38]
      icon: <PenTool className="w-6 h-6" />
    },
    {
      title: "엔지니어링", // [cite: 49]
      description: "시공성 및 물량 검토를 위한 최적화된 솔루션을 제공합니다.", // [cite: 50]
      icon: <Building2 className="w-6 h-6" />
    }
  ];

  // 주요 프로젝트 데이터 [cite: 16, 18, 25, 28, 29]
  const projects = [
    { title: "카타르 루사일 플라자 타워", category: "Global Landmark", year: "2020" }, // [cite: 29]
    { title: "삼성전자 평택캠퍼스 사무2동", category: "High-Tech", year: "2019" }, // [cite: 28]
    { title: "한국은행 본관 통합별관", category: "Public", year: "2017" }, // [cite: 25]
    { title: "경주 화백컨벤션센터", category: "Convention", year: "2011" }, // [cite: 18]
    { title: "용인시민체육공원", category: "Sports", year: "2009" } // [cite: 16]
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <NsmHomeCorner />
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tighter text-blue-900 leading-none">nDB Architects</span> {/*  */}
            <span className="text-[10px] text-slate-500 tracking-widest uppercase mt-1">Digital Engineering Solution</span>
          </div>
          <div className="hidden md:flex space-x-8 text-xs font-semibold uppercase tracking-widest text-slate-600">
            <a href="#services" className="hover:text-blue-600">Services</a>
            <a href="#projects" className="hover:text-blue-600">Projects</a>
            <a href="#about" className="hover:text-blue-600">About</a>
            <a href="#contact" className="hover:text-blue-600">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 to-transparent z-10" />
        {/* 포트폴리오 이미지를 배경으로 넣으실 수 있습니다 */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-8">
              Digital Craftsmanship <br />
              <span className="text-blue-500">for Architecture</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed mb-10">
              기획부터 시공까지, 생애주기 전 단계에 걸쳐 <br />
              첨단 BIM 기술 기반의 엔지니어링 솔루션을 제공합니다. {/* [cite: 37] */}
            </p>
            <div className="flex space-x-4">
              <a href="#projects" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-sm text-sm font-bold transition">
                View Projects
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20">
            <div>
              <h2 className="text-4xl font-bold mb-4">Our Expertise</h2>
              <p className="text-slate-500">BIM 설계 프로세스를 적용한 혁신적인 업무 영역</p> {/* [cite: 37] */}
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-1">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white p-10 border border-slate-200 hover:border-blue-500 transition-colors group">
                <div className="text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section id="projects" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-16 text-center italic tracking-tight">Featured Works</h2>
          <ProjectZoomGallery projects={ndbProjects} />
        </div>
      </section>

      {/* Profile Section */}
      <section id="about" className="py-32 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <div className="aspect-[3/4] bg-slate-800 relative">
             {/* [cite: 2] 김상환 소장님 사진 배치 권장 */}
          </div>
          <div>
            <span className="text-blue-500 font-bold tracking-[0.3em] text-xs uppercase mb-6 block">Representative</span>
            <h2 className="text-5xl font-bold mb-2">김상환</h2> {/* [cite: 6] */}
            <p className="text-xl text-slate-400 mb-10 font-light italic">Managing Director / Architect</p>
            
            <div className="space-y-10">
              <div>
                <h4 className="text-sm font-bold border-b border-white/10 pb-2 mb-4 uppercase tracking-wider">Experience</h4>
                <ul className="text-slate-400 text-sm space-y-2 font-light">
                  <li>(주)해안종합건축사사무소</li> {/* [cite: 11] */}
                  <li>(주)희림종합건축사사무소</li> {/* [cite: 12] */}
                  <li>한양대학교(ERICA) 겸임교수</li> {/* [cite: 14] */}
                  <li>경기주택도시공사 기술자문위원(건축BIM)</li> {/* [cite: 14] */}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold border-b border-white/10 pb-2 mb-4 uppercase tracking-wider">Education</h4>
                <ul className="text-slate-400 text-sm space-y-2 font-light">
                  <li>한양대학교 대학원 건축공학과</li> {/* [cite: 9] */}
                  <li>한양대학교 건축학과</li> {/* [cite: 8] */}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <footer id="contact" className="bg-white border-t py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between">
          <div className="mb-12 md:mb-0">
            <h3 className="text-2xl font-bold mb-8">nDB Architects</h3> {/*  */}
            <div className="space-y-4 text-sm text-slate-500">
              <p className="flex items-center"><MapPin className="w-4 h-4 mr-3 text-blue-600" /> 서울시 서초구 사평대로 18 402</p> {/* [cite: 4] */}
              <p className="flex items-center"><Phone className="w-4 h-4 mr-3 text-blue-600" /> 010-2927-0651</p> {/* [cite: 4] */}
              <p className="flex items-center italic"><Mail className="w-4 h-4 mr-3 text-blue-600" /> nDB_Arch@contact.com</p>
            </div>
          </div>
          <div className="max-w-md w-full">
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-8">
              기능성, 경제성, 지속가능성 등 다양한 고객의 요구에 부응하는 <br />
              차별화된 엔지니어링 솔루션을 제공할 것을 약속드립니다. {/* [cite: 38, 39] */}
            </p>
            <div className="flex items-center text-xs font-bold text-slate-900 uppercase tracking-widest">
              © 2026 nDB Architects. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}