// components/Layout.js
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="relative min-h-screen">
      {/* --- Fixed Background --- */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/backgrounds/home-bg-mobile.jpg')",
          backgroundAttachment: "fixed",
          WebkitBackgroundAttachment: "fixed",
        }}
      />
      <div
        className="hidden md:block fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/backgrounds/home-bg.jpg')",
          backgroundAttachment: "fixed",
          WebkitBackgroundAttachment: "fixed",
        }}
      />

      {/* --- Header --- */}
      <header className="flex items-center justify-between py-6 px-6 md:px-12 relative z-20">
        <Link href="/" onClick={closeMenu}>
          <img
            src="/atlantic_walk_logo_transparent.png"
            alt="Atlantic Walk Research Logo"
            className="h-14 md:h-20 w-auto cursor-pointer transition-transform hover:scale-105"
          />
        </Link>

        {/* --- Hamburger (mobile only) --- */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center space-y-1 p-2 rounded-md bg-white/70 backdrop-blur-sm border border-black/10"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-black transition-transform duration-300 ${
              menuOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-black transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-black transition-transform duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </button>
      </header>

      {/* --- Desktop Nav --- */}
      <nav className="hidden md:flex justify-center gap-6 text-lg font-medium text-black mb-6 relative z-20">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/models" className="hover:underline">Models</Link>
        <Link href="/research" className="hover:underline">Research Library</Link>
        <Link href="/performance" className="hover:underline">Performance</Link>
        <Link href="/about" className="hover:underline">About</Link>
        <Link href="/contact" className="hover:underline">Contact</Link>
      </nav>

      {/* --- Backdrop for mobile menu --- */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* --- Mobile Dropdown Nav --- */}
      <div
        className={`
          fixed left-0 right-0 top-[88px] z-20 md:hidden
          transition-all duration-300 ease-in-out
          ${
            menuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          }
        `}
      >
        <div className="mx-4 rounded-xl bg-white/90 backdrop-blur-md shadow-xl border border-black/10 overflow-hidden">
          <nav className="flex flex-col items-stretch text-lg font-medium text-black">
            <Link href="/" onClick={closeMenu} className="px-5 py-3 hover:bg-black/5">
              Home
            </Link>
            <Link href="/models" onClick={closeMenu} className="px-5 py-3 hover:bg-black/5">
              Models
            </Link>
            <Link href="/research" onClick={closeMenu} className="px-5 py-3 hover:bg-black/5">
              Research Library
            </Link>
            <Link href="/performance" onClick={closeMenu} className="px-5 py-3 hover:bg-black/5">
              Performance
            </Link>
            <Link href="/about" onClick={closeMenu} className="px-5 py-3 hover:bg-black/5">
              About
            </Link>
            <Link href="/contact" onClick={closeMenu} className="px-5 py-3 hover:bg-black/5">
              Contact
            </Link>
          </nav>
        </div>
      </div>

      {/* --- Main --- */}
      <main className="relative z-10">{children}</main>

      {/* --- Footer --- */}
      <footer className="mt-16 text-sm text-gray-200 border-t pt-4 text-center relative z-10">
        <p>© 2025 Atlantic Walk Research · Independent research only · Not investment advice.</p>
      </footer>
    </div>
  );
}
