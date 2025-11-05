
// components/Layout.js
import Link from "next/link";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const router = useRouter();
  const isHome = router.pathname === "/";

  return (
    <div
      className="min-h-screen bg-cover bg-fixed"
      style={{
        backgroundImage: `url('/background.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: isHome ? "center center" : "left 60%",
      }}
    >
      <header className="flex justify-center py-6">
        <Link href="/">
          <img
            src="/atlantic_walk_logo_transparent.png"
            alt="Atlantic Walk Research Logo"
            className="h-16 w-auto cursor-pointer"
          />
        </Link>
      </header>

      <nav className="flex justify-center gap-6 text-lg font-medium text-black mb-8">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/models" className="hover:underline">Models</Link>
        <Link href="/research" className="hover:underline">Research Library</Link>
        <Link href="/performance" className="hover:underline">Performance</Link>
        <Link href="/about" className="hover:underline">About</Link>
        <Link href="/contact" className="hover:underline">Contact</Link>
      </nav>

      <main>{children}</main>

      <footer className="mt-16 text-sm text-gray-200 border-t pt-4 text-center">
        <p>
          &copy; 2025 Atlantic Walk Research. Independent research only. Not investment advice.
        </p>
      </footer>
    </div>
  );
}
