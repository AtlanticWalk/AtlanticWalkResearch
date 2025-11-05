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
      <header cl
