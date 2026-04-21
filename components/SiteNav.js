import { useState, useEffect } from 'react';
import Link from 'next/link';

const NAV_ITEMS = [
  ['Home', '/'],
  ['Highlights', '/highlights'],
  ['Research', '/research-packs'],
  ['Performance', '/performance'],
  ['About', '/about'],
  ['Contact', '/contact'],
];

export default function SiteNav({ onSubscribeClick }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <div className="bg-black/60 backdrop-blur-sm border-b border-gray-800">
          <div className="px-4 h-11 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <img
                src="/atlantic_walk_logo_transparent.png"
                alt="Atlantic Walk Research"
                className="h-8 w-auto"
              />
            </Link>

            <button
              aria-label="Toggle menu"
              onClick={() => setOpen((s) => !s)}
              className="inline-flex items-center justify-center rounded-xl border border-gray-700 p-2 text-gray-200"
            >
              <span className="block h-0.5 w-5 bg-current mb-1" />
              <span className="block h-0.5 w-5 bg-current mb-1" />
              <span className="block h-0.5 w-5 bg-current" />
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
            open ? 'max-h-96' : 'max-h-0'
          }`}
        >
          <div className="bg-black/80 backdrop-blur-sm border-b border-gray-800">
            <nav className="px-4 py-3 flex flex-col gap-3 text-gray-200">
              {NAV_ITEMS.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="py-2 px-2 text-left rounded-lg hover:bg-white/5"
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={() => { setOpen(false); onSubscribeClick?.(); }}
                className="py-2 px-2 text-left rounded-lg text-blue-400 font-semibold hover:bg-white/5"
              >
                Subscribe
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:flex fixed top-0 w-full bg-black/60 backdrop-blur-sm border-b border-gray-800 z-50 py-2.5 text-base font-semibold text-gray-300 items-center px-6">
        <div className="flex-1 flex justify-center gap-6 items-center">
          {NAV_ITEMS.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-white transition">
              {label}
            </Link>
          ))}
          <button
            onClick={onSubscribeClick}
            className="ml-2 text-gray-100 text-sm font-semibold px-4 py-1.5 rounded-lg transition border border-gray-700 hover:bg-white/5 hover:border-gray-600"
          >
            Subscribe
          </button>
        </div>
      </nav>
    </>
  );
}
