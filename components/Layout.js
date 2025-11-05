// components/Layout.js
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="relative min-h-screen flex flex-col text-gray-100">
      {/* --- Header --- */}
      <header className="flex items-center justify-between px-6 md:px-12 py-6 backdrop-blur-sm bg-black/40 border-b border-gray-800 sticky top-0 z-30">
        <Link href="/" onClick={closeMenu}>
          <img
            src="/atlantic_walk_logo_transparent.png"
            alt="Atlantic Walk Research Logo"
            className="h-14 md:h-20 w-auto cursor-pointer transition-transform hover:scale-105"
          />
        </Link>

        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden flex flex-col justify-center items-center space-y-1 p-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/10"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${menuOpen ? "opacity-0" : "opacity-100"}`} />
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 text-base font-medium text-gray-200">
          {[
            ["Home", "/"],
            ["Models", "/models"],
            ["Research", "/research"],
            ["Performance", "/performance"],
            ["About", "/about"],
            ["Contact", "/contact"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-white transition">
              {label}
            </Link>
          ))}
        </nav>
      </header>

      {/* --- Mobile dropdown nav --- */}
      {menuOpen && (
        <div className="md:hidden px-6 bg-black/70 backdrop-blur-md border-b border-gray-700 shadow-xl z-20">
          <nav className="flex flex-col text-lg font-medium text-gray-100">
            {[
              ["Home", "/"],
              ["Models", "/models"],
              ["Research", "/research"],
              ["Performance", "/performance"],
              ["About", "/about"],
              ["Contact", "/contact"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className="py-3 border-b border-gray-800 hover:bg-white/10 transition"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* --- Main content container --- */}
      <main className="flex-1 w-full flex justify-center px-4 md:px-8">
        <div className="w-full max-w-5xl bg-neutral-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-xl p-6 md:p-10 my-8">
          {children}
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="backdrop-blur-sm bg-black/40 border-t border-gray-800 py-6 text-center text-sm text-gray-400">
        © 2025 Atlantic Walk Research · Independent Equity Research · Not Financial Advice
      </footer>
    </div>
  );
}
