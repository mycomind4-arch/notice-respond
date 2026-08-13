import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export function Logo() {
  return (
    <span aria-hidden className="relative inline-flex h-8 w-10 items-center justify-center rounded-sm border border-ink bg-paper-deep overflow-hidden">
      <svg className="h-4 w-4 text-stamp" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M5 3h14v18l-7-3-7 3V3z" /></svg>
    </span>
  );
}

export function SiteHeader({ variant = "default" }: { variant?: "default" | "transparent" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const transparent = variant === "transparent";

  const navItems = [
    { label: "How it works", href: "/#how" },
    { label: "What you can respond to", href: "/#workflows" },
    { label: "Pricing", href: "/pricing" },
    { label: "Resources", href: "/resources" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <header className={`sticky top-0 z-50 border-b transition-all ${transparent ? "border-transparent bg-transparent" : "border-rule/60 bg-paper/85 backdrop-blur-md"}`}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <Logo />
          <span className={`font-serif text-lg leading-none transition-colors ${transparent ? "text-white group-hover:text-stamp-soft" : "group-hover:text-stamp"}`}>
            Notice Respond
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className={`px-3 py-2 text-sm transition-colors ${transparent ? "text-white/80 hover:text-white" : "text-ink-soft hover:text-foreground"}`}>
              {item.label}
            </a>
          ))}
          <Link to="/dashboard" className={`ml-2 px-3 py-2 text-sm transition-colors ${transparent ? "text-white/90 hover:text-white" : "text-ink-soft hover:text-foreground"}`}>
            My Mailings
          </Link>
          <Link to="/workflows/irs-notice" className={`ml-2 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-transform hover:-translate-y-0.5 ${transparent ? "bg-stamp text-accent-foreground shadow-stamp" : "bg-primary text-primary-foreground shadow-stamp"}`}>
            Respond to a notice
          </Link>
        </div>

        <button className="flex h-9 w-9 items-center justify-center rounded-md border border-rule md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" aria-expanded={mobileOpen}>
          {mobileOpen ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-rule bg-paper md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="rounded-md px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-muted/50 hover:text-foreground" onClick={() => setMobileOpen(false)}>
                {item.label}
              </a>
            ))}
            <Link to="/dashboard" className="rounded-md px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-muted/50 hover:text-foreground" onClick={() => setMobileOpen(false)}>My Mailings</Link>
            <Link to="/workflows/irs-notice" className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground" onClick={() => setMobileOpen(false)}>Respond to a notice</Link>
          </div>
        </div>
      )}
    </header>
  );
}
