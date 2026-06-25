"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCapsuleCount } from "@/lib/storage";

const navLinks = [
  { href: "/write", label: "写信" },
  { href: "/capsules", label: "我的胶囊" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { unopened: badgeCount } = useCapsuleCount();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg-deep/95 backdrop-blur-xl shadow-lg shadow-black/20"
          : "bg-bg-deep/70 backdrop-blur-md"
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif font-bold text-amber text-lg tracking-wide hover:text-amber-light transition-colors"
        >
          ⏳ 时间胶囊
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-warm-white/80 hover:text-amber transition-colors text-sm font-sans font-medium tracking-wide"
            >
              {link.label}
              {link.href === "/capsules" && badgeCount > 0 && (
                <span
                  className="absolute -top-2 -right-4 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
                  style={{ backgroundColor: "#8a3a2a" }}
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-warm-white/80 hover:text-amber transition-colors p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="菜单"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span
              className={`block h-0.5 bg-current transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            />
            <span
              className={`block h-0.5 bg-current transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 bg-current transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-4 flex flex-col gap-3 border-t border-rule">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-warm-white/80 hover:text-amber transition-colors text-sm font-sans py-2"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
              {link.href === "/capsules" && badgeCount > 0 && (
                <span
                  className="ml-2 inline-flex min-w-[18px] h-[18px] rounded-full items-center justify-center text-[10px] font-bold text-white px-1"
                  style={{ backgroundColor: "#8a3a2a" }}
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
