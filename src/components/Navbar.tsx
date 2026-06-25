"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCapsuleCount } from "@/lib/storage";
import { IconMenu, IconClose, IconMailbox, IconEnvelope, IconPen } from "@/components/Icons";

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
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled
          ? "rgba(26,21,18,0.9)"
          : "rgba(26,21,18,0.6)",
        backdropFilter: scrolled ? "blur(12px)" : "blur(4px)",
        borderBottom: scrolled
          ? "1px solid rgba(212,165,116,0.1)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <IconMailbox size={20} color="#d4a574" />
          <span className="font-serif font-bold text-amber text-lg tracking-wide">
            时间胶囊
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-full text-sm font-sans text-warm-muted hover:text-amber hover:bg-amber/10 transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}

          {/* Write button */}
          <Link
            href="/write"
            className="ml-2 px-5 py-2 bg-amber text-bg-deep font-sans font-semibold text-sm rounded-full hover:bg-amber-light transition-all duration-200 btn-lift"
          >
            <span className="flex items-center gap-1.5">
              <IconPen size={14} />
              写一封信
            </span>
          </Link>
        </div>

        {/* Mobile: hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-amber"
          aria-label="打开菜单"
        >
          {menuOpen ? <IconClose size={24} /> : <IconMenu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-64 z-50 md:hidden animate-slide-in-right"
            style={{ backgroundColor: "rgba(26,21,18,0.95)", backdropFilter: "blur(16px)" }}
          >
            <div className="flex items-center justify-between p-6">
              <span className="font-serif font-bold text-amber">菜单</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="text-warm-muted hover:text-amber"
                aria-label="关闭菜单"
              >
                <IconClose size={20} />
              </button>
            </div>

            <div className="px-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-warm-muted hover:text-amber hover:bg-amber/10 transition-all font-sans text-sm"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/write"
                onClick={() => setMenuOpen(false)}
                className="block mt-4 px-4 py-3 bg-amber text-bg-deep font-sans font-semibold text-sm rounded-full text-center"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <IconPen size={14} />
                  写一封信
                </span>
              </Link>

              {/* Capsule count hint */}
              {badgeCount > 0 && (
                <div className="mt-6 px-4 py-3 rounded-lg"
                  style={{ backgroundColor: "rgba(212,165,116,0.08)" }}
                >
                  <p className="text-warm-muted text-xs font-sans">
                    你有 {badgeCount} 封胶囊等待开启
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
