import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-10">
        <Image
          src="/branding/ndb-v.svg"
          alt="NDB"
          width={220}
          height={220}
          priority
          className="w-44 md:w-56"
        />
        <p className="text-sm tracking-[0.3em] text-neutral-400 uppercase">
          Site Under Construction
        </p>
      </div>

      <Link
        href="/"
        className="absolute bottom-10 text-xs tracking-widest text-neutral-300 hover:text-neutral-500 transition-colors uppercase"
      >
        N+S+M
      </Link>
    </main>
  );
}
