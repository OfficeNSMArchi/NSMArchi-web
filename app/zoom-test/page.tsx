"use client";

import React, { useState, useRef, useCallback, useEffect, CSSProperties } from 'react';

// --- ANIMATION SETTINGS (Edit these to adjust timing) ---
const ZOOM_DURATION = 1500;    // Time for the whole page to zoom in/out (ms)
const MODAL_DELAY =  10;      // Extra waiting time after zoom finishes before modal appears (ms)
const MODAL_FADE_IN = 3000;    // Duration of the modal fade-in animation (ms)
const MODAL_FADE_OUT = 1500;   // Duration of the modal fade-out animation (ms)
const OVERLAY_OPACITY = 0;   // Background darkness when modal is open (0 to 100)
const MODAL_HEIGHT_BUFFER = 10; // Extra px added to modal height to cover sub-pixel card edges
// --------------------------------------------------------

interface CardProps {
  id: number;
  title: string;
  image?: string;
  onCardClick: (id: number, rect: DOMRect, image?: string) => void;
  isVisible: boolean;
}

const Card: React.FC<CardProps> = ({ id, title, image, onCardClick, isVisible }) => {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (ref.current) {
      onCardClick(id, ref.current.getBoundingClientRect(), image);
    }
  };

  return (
    <button
      ref={ref}
      className={`relative w-60 h-40 overflow-hidden p-0 border-0 bg-transparent ${isVisible ? '' : 'opacity-0'}`}
      onClick={handleClick}
      style={{ visibility: isVisible ? 'visible' : 'hidden', touchAction: 'manipulation', display: 'block' }}
    >
      {image ? (
        <img src={image} alt={title} className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">{title}</div>
      )}
    </button>
  );
};

export default function ZoomTestPage() {
  const [selectedCardData, setSelectedCardData] = useState<{ id: number; title: string; rect: DOMRect; image?: string; vw: number; vh: number; shouldZoom: boolean } | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 모달 열릴 때 body 스크롤 잠금, 닫힐 때 해제
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleCardClick = (id: number, rect: DOMRect, image?: string) => {
    const title = `Project ${id + 1}`;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const shouldZoom = (vw * 0.4) / rect.width >= 1;
    setSelectedCardData({ id, title, rect, image, vw, vh, shouldZoom });
    if (shouldZoom) setIsZoomed(true);

    setTimeout(() => {
      setIsModalOpen(true);
    }, shouldZoom ? ZOOM_DURATION + MODAL_DELAY : MODAL_DELAY);
  };

  const handleCloseModal = () => {
    const shouldZoom = selectedCardData?.shouldZoom ?? false;
    setIsModalOpen(false);

    if (shouldZoom) {
      // zoom-out 후 cleanup
      setTimeout(() => {
        setIsZoomed(false);
        setTimeout(() => setSelectedCardData(null), ZOOM_DURATION);
      }, MODAL_FADE_OUT);
    } else {
      // 모바일: 그냥 페이드아웃 후 cleanup
      setTimeout(() => setSelectedCardData(null), MODAL_FADE_OUT);
    }
  };

  const getContainerStyle = useCallback((): CSSProperties => {
    if (!selectedCardData) {
      return {
        transition: `transform ${ZOOM_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        transform: 'translate(0, 0) scale(1)',
        transformOrigin: '0 0',
      };
    }

    // 모바일(shouldZoom=false): 배경 고정, transform 없음
    if (!selectedCardData.shouldZoom) {
      return {
        transform: 'translate(0, 0) scale(1)',
        transformOrigin: '0 0',
      };
    }

    const { rect, vw: viewportWidth, vh: viewportHeight } = selectedCardData;

    const targetCardWidth = viewportWidth * 0.4;
    const targetScale = targetCardWidth / rect.width;

    const targetCardCenterX = viewportWidth * 0.3;
    const targetCardCenterY = viewportHeight * 0.5;

    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    const translateX = Math.round(targetCardCenterX - cardCenterX * targetScale);
    const translateY = Math.round(targetCardCenterY - cardCenterY * targetScale);

    if (!isZoomed) {
      return {
        transform: 'translate(0, 0) scale(1)',
        transition: `transform ${ZOOM_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        transformOrigin: '0 0',
        position: 'relative',
      };
    }

    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${targetScale})`,
      transition: `transform ${ZOOM_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      transformOrigin: '0 0',
      position: 'relative',
    };
  }, [selectedCardData, isZoomed]);

  const getModalStyle = useCallback((): CSSProperties => {
    if (!selectedCardData) return { display: 'none' };

    const { rect, vw: viewportWidth, vh: viewportHeight, shouldZoom } = selectedCardData;

    const baseStyle: CSSProperties = {
      position: 'fixed',
      left: '0',
      width: '100%',
      opacity: isModalOpen ? 1 : 0,
      pointerEvents: isModalOpen ? 'auto' : 'none',
      transition: `opacity ${isModalOpen ? MODAL_FADE_IN : MODAL_FADE_OUT}ms ease-in-out`,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: 'white',
      overflow: 'hidden',
    };

    if (shouldZoom) {
      // 데스크탑: 뷰포트 중앙에 위치
      const targetScale = (viewportWidth * 0.4) / rect.width;
      const cardHeight = Math.round(rect.height * targetScale) + MODAL_HEIGHT_BUFFER;
      const modalTop = Math.round(viewportHeight * 0.5 - cardHeight / 2);
      return { ...baseStyle, top: `${modalTop}px`, height: `${cardHeight}px` };
    } else {
      // 모바일: 카드 위치에 정확히 오버랩
      const modalTop = Math.round(rect.top) - Math.floor(MODAL_HEIGHT_BUFFER / 2);
      const cardHeight = Math.round(rect.height) + MODAL_HEIGHT_BUFFER;
      return { ...baseStyle, top: `${modalTop}px`, height: `${cardHeight}px` };
    }
  }, [selectedCardData, isModalOpen]);

  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
      `}</style>

      <div 
        ref={containerRef}
        style={getContainerStyle()}
        className="min-h-screen p-8 flex flex-col items-center justify-center"
      >
        <h1 className="text-4xl font-bold mb-12">World Zoom Test Page</h1>
        
        <div className="relative w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              id={i}
              title={`Project ${i + 1}`}
              image={i === 1 ? 'https://picsum.photos/seed/arch2/800/600' : undefined}
              onCardClick={handleCardClick}
              isVisible={true}
            />
          ))}
        </div>
      </div>

      {/* DEBUG OVERLAY - 확인 후 삭제 */}
      {selectedCardData && (
        <div style={{ position: 'fixed', top: 0, right: 0, background: 'red', color: 'white', zIndex: 9999, padding: '4px 8px', fontSize: '11px', lineHeight: 1.4 }}>
          shouldZoom: {String(selectedCardData.shouldZoom)}<br/>
          vw: {selectedCardData.vw}<br/>
          rect.w: {Math.round(selectedCardData.rect.width)}
        </div>
      )}

      {/* Modal / Detail View */}
      {selectedCardData && (
        <div
          className="fixed inset-0 z-40"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${OVERLAY_OPACITY / 100})`,
            opacity: isModalOpen ? 1 : 0,
            pointerEvents: isModalOpen ? 'auto' : 'none',
            transition: `opacity ${isModalOpen ? MODAL_FADE_IN : MODAL_FADE_OUT}ms ease-in-out`
          }}
          onClick={handleCloseModal}
        >
          <div 
            style={getModalStyle()} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Horizontal Scrollable Container */}
            <div 
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseUp}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex h-full overflow-x-auto overflow-y-hidden w-full hide-scrollbar ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
            >
              {/* 데스크탑 전용: 왼쪽 정보 패널 */}
              {selectedCardData.shouldZoom && (
                <div
                  className="h-full flex-shrink-0 flex items-center justify-center px-4 bg-white border-r border-gray-100"
                  style={{ width: '10%' }}
                >
                  <div className="text-xs text-gray-400 font-mono uppercase vertical-text">
                    Project Information
                  </div>
                </div>
              )}

              {/* Part 1: Card Cover */}
              <div
                className="flex-shrink-0 overflow-hidden self-center"
                style={selectedCardData.shouldZoom ? {
                  // 데스크탑: 뷰포트의 40%
                  width: '40%',
                  height: `${Math.round(selectedCardData.rect.height * ((selectedCardData.vw * 0.4) / selectedCardData.rect.width))}px`,
                } : {
                  // 모바일: 카드 원본 크기에 맞춤, rect.left만큼 margin
                  marginLeft: `${selectedCardData.rect.left}px`,
                  width: `${selectedCardData.rect.width}px`,
                  height: `${selectedCardData.rect.height}px`,
                }}
              >
                {selectedCardData.image ? (
                  <img src={selectedCardData.image} alt={selectedCardData.title} className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                    {selectedCardData.title}
                  </div>
                )}
              </div>

              {/* Part 2: Content */}
              <div className="w-[80%] flex-shrink-0 p-12 text-black bg-white relative flex flex-col pointer-events-none">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-6 right-6 text-gray-400 hover:text-black text-3xl transition-colors z-50 pointer-events-auto"
                >
                  &times;
                </button>
                
                <h2 className="text-4xl font-bold mb-6">{selectedCardData.title}</h2>
                <div className="prose prose-lg">
                  <p className="text-xl text-gray-600 mb-8">
                    Horizontal layout spanning 100% of the screen.
                  </p>
                  <p>
                    Scroll right to see more...
                  </p>
                </div>
              </div>

              {/* Part 3: More Content */}
              <div className="w-[80%] flex-shrink-0 p-12 text-black bg-gray-50 flex flex-col pointer-events-none">
                <h2 className="text-4xl font-bold mb-6">Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-64 bg-gray-200 flex items-center justify-center border border-gray-300">Image A</div>
                  <div className="h-64 bg-gray-200 flex items-center justify-center border border-gray-300">Image B</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
