// components/Layout.js
import Link from "next/link";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const router = useRouter();
  const isHome = router.pathname === "/";

  return (
    <div
      className={`
        min-h-screen bg-cover bg-fixed
        bg-[url('/backgrounds/home-bg-mobile.jpg')]
        md:bg-[url('/backgrounds/home-bg.jpg')]
      `}
      style={{
        backgroundPosition: isHome ? "center center" : "left 60%",
      }}
    >
      {/* --- Header --- */}
      <header className="flex justify-center py-6">
        <Link href="/">
          <img
            src="/atlantic_walk_logo_transparent.png"
            alt="Atlantic Walk Research Logo"
            className="h-16 md:h-20 w-auto cursor-pointer transition-transform hover:scale-105"
          />
        </Link>
      </header>

      {/* --- Navigation with mobile scroll & fades --- */}
      <div className="relative mb-8">
        {/* fade on left */}
        <div className="absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent pointer-events-none md:hidden" />
        {/* fade on right */}
        <div className="absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden" />

        <nav
          className="
            flex gap-6 justify-center md:justify-center
            text-base md:text-lg font-medium text-black
            overflow-x-auto whitespace-nowrap px-6 md:px-0
            scroll-smooth
          "
        >
          <Link href="/" className="hover:underline flex-shrink-0">
            Home
          </Link>
          <Link href="/models" className="hover:underline flex-shrink-0">
            Models
          </Link>
          <Link href="/research" className="hover:underline flex-shrink-0">
            Research Library
          </Link>
          <Link href="/performance" className="hover:underline flex-shrink-0">
            Performance
          </Link>
          <Link href="/about" className="hover:underline flex-shrink-0">
            About
          </Link>
          <Link href="/contact" className="hover:underline flex-shrink-0">
            Contact
          </Link>
        </nav>
      </div>

      {/* --- Main Content --- */}
      <main>{children}</main>

      {/* --- Footer --- */}
      <footer className="mt-16 text-sm text-gray-200 border-t pt-4 text-center">
        <p>
          &copy; 2025 Atlantic Walk Research. Independent research only. Not investment advice.
        </p>
      </footer>
    </div>
  );
}
