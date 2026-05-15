import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdminPath = req.nextUrl.pathname.startsWith("/admin");

  // 로컬 개발 환경에서는 인증 불필요
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  // 배포 환경에서 /admin 접근 시 로그인 체크
  if (isAdminPath && !req.auth) {
    const signInUrl = new URL("/api/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
