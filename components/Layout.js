// components/Layout.js
import Link from "next/link";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const router = useRouter();
  const isHome = router.pathname === "/";

  // Maintain your original background positioning logic
  const posClasses = isHome
    ? "bg-center md:bg-center"
    : "bg-center md:bg-[position:left_60%]";

  return (
    <div
      // Background handled by .bg-awr in globals.css (mobile + desktop swap)
      className={`min-h-screen bg-awr bg-cover md:bg-fixed ${posClasses}`}
    >
      {/* Main page content */}
      <main>{children}</main>
import Newsletter from '../components/Newsletter';

// Other existing imports

const Layout = () => {
    return (
        <div>
            {/* Other components like header, main content, etc. */}
            <Newsletter />
            <footer>Footer content here</footer>
        </div>
    );
};

export default Layout;
      {/* Footer */}
      <footer className="mt-16 text-sm text-gray-200 border-t pt-4 text-center">
        <p>
          &copy; {new Date().getFullYear()} Atlantic Walk Research. Independent
          research only. Not investment advice.
        </p>
      </footer>
    </div>
  );
}
