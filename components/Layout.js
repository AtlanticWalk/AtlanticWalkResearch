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

      <main>{children}</main>

      <footer className="mt-16 text-sm text-gray-200 border-t pt-4 text-center">
        <p>
          &copy; 2025 Atlantic Walk Research. Independent research only. Not investment advice.
        </p>
      </footer>
    </div>
  );
}
