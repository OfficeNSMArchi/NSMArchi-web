"use client"

import Link from "next/link"

export function NsmHomeCorner() {
  return (
    <Link
      href="/"
      aria-label="Go to N+S+M"
      className="fixed top-0 left-0 z-[200] w-[22px] h-[22px] transition-transform hover:scale-110 focus:outline-none"
      style={{
        background: 'linear-gradient(135deg, white 50%, black 50%)',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
      >
        <span
          className="absolute"
          style={{
            fontSize: '8px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'white',
            bottom: '11px',
            right: '-1px',
            lineHeight: 1,
            transform: 'rotate(-45deg)',
            transformOrigin: 'bottom right',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          NSM
        </span>
      </div>
    </Link>
  )
}
