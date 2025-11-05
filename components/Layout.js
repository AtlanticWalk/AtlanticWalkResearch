// components/Layout.js
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

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
      <header className="flex items-center justify-between py-6 px-6 md:px-12 relative z-50">
        <Link href="/">
          <img
            src="/atlantic_walk_logo_transparent.png"
            alt="Atlantic Walk Research Logo"
            className="h-14 md:h-20 w-auto cursor-pointer transition-transform hover:scale-105"
          />
        </Link>

        {/* Hamburger (mobile only) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center space-y-1"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-black transition-transform duration-300 ${
              menuOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-black transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-black transition-transform duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          ></span>
        </button>
      </header>

      {/* --- Translucent backdrop when menu open --- */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* --- Navigation --- */}
      <nav
        className={`
          flex flex-col md:flex-row md:justify-center items-center gap-6 text-lg font-medium text-black
          md:static md:opacity-100
          fixed top-20 left-0 w-full bg-white/90 md:bg-transparent z-50
          transition-all duration-300 ease-in-out
          ${
            menuOpen
              ? "max-h-96 opacity-100 pointer-events-auto"
              : "max-h-0 opacity-0 pointer-events-none md:pointer-events-auto"
          }
        `}
      >
        <Link href="/" onClick={() => setMenuOpen(false)} className="hover:underline">
          Home
        </Link>
        <Link href="/models" onClick={() => setMenuOpen(false)} className="hover:underline">
          Models
        </Link>
        <Link href="/research" onClick={() => setMenuOpen(false)} className="hover:underline">
          Research Library
        </Link>
        <Link href="/performance" onClick={() => setMenuOpen(false)} className="hover:underline">
          Performance
        </Link>
        <Link href="/about" onClick={() => setMenuOpen(false)} className="hover:underline">
          About
        </Link>
        <Link href="/contact" onClick={() => setMenuOpen(false)} className="hover:underline">
          Contact
        </Link>
      </nav>

      {/* --- Main Content --- */}
      <main className="relative z-10">{children}</main>

      {/* --- Footer --- */}
      <footer className="mt-16 text-sm text-gray-200 border-t pt-4 text-center">
        <p>
          &copy; 2025 Atlantic Walk Research. Independent research only. Not investment advice.
        </p>
      </footer>
    </div>
  );
}
