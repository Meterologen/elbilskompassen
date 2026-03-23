"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/kompassen", label: "Elbilskompassen" },
  { href: "/kalkyl", label: "Räkna på det" },
  { href: "/modeller", label: "Modeller" },
  { href: "/leasing", label: "Leasing" },
  { href: "/laddning", label: "Laddning" },
  { href: "/faq", label: "FAQ" },
  { href: "/aktuellt", label: "Aktuellt" },
  { href: "/om-oss", label: "Om oss" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav – hidden on mobile */}
      <nav className="hidden sm:flex items-center gap-5 text-sm" aria-label="Huvudnavigering">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-slate-700 transition hover:text-sky-600 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile hamburger button – visible on small screens */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="sm:hidden flex flex-col items-center justify-center gap-1.5 rounded-md p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        aria-label={open ? "Stäng meny" : "Öppna meny"}
        aria-expanded={open}
      >
        <span className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${open ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`block h-0.5 w-5 bg-current transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
        <span className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      {/* Mobile dropdown menu */}
      {open && (
        <nav
          className="absolute left-0 right-0 top-14 z-20 border-b border-sky-200/60 bg-white/95 backdrop-blur-md sm:hidden"
          aria-label="Mobilnavigering"
        >
          <div className="mx-auto max-w-5xl px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
