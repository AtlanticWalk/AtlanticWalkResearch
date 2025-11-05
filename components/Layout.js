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
      className={
