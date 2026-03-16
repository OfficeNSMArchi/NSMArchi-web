import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
// 1. 언어 관리 본부를 불러옵니다
import { LanguageProvider } from '@/lib/language-context' 

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'N/S/M | Architecture & Design Collaborative',
  description: 'NDB, SNP, META LOGIC - 건축과 도시의 미래를 함께 만들어가는 협력체',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko"> {/* 한국어 사이트니까 ko로 바꿨습니다 */}
      <body className="font-sans antialiased">
        {/* 2. 모든 페이지 내용을 언어 관리 본부로 감싸줍니다 */}
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}