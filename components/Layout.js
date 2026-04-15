// components/Layout.js
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const router = useRouter();
  const isHome = router.pathname === "/";

  const posClasses = isHome
    ? "bg-center md:bg-center"
    : "bg-center md:bg-[position:left_60%]";

  return (
    <div
      className={`min-h-screen bg-awr bg-cover md:bg-fixed ${posClasses}`}
    >
      <main>{children}</main>
      <footer className="mt-16 text-sm text-gray-200 border-t pt-4 text-center">
        <p>
          &copy; {new Date().getFullYear()} Atlantic Walk Research. Independent
          research only. Not investment advice.
        </p>
      </footer>
    </div>
  );
}
