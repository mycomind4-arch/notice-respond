import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ECOSYSTEM_PRODUCTS, ECOSYSTEM_PAGE_URL } from "./ecosystem-nav";

export function Logo() {
  return <span aria-hidden className="relative inline-flex h-8 w-10 items-center justify-center rounded-sm border border-ink bg-paper-deep overflow-hidden"><svg className="h-4 w-4 text-stamp" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M5 3h14v18l-7-3-7 3V3z" /></svg></span>;
}


function WorkflowsDropdown({ transparent }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  return <div ref={ref} className="relative">
    <button type="button" onClick={() => setOpen(!open)} className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors ${transparent ? "text-white/80 hover:text-white" : "text-ink-soft hover:text-foreground"}`}>Products<ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} /></button>
    {open && <div className="absolute left-0 top-full z-50 mt-1.5 w-[520px] max-w-[calc(100vw-2rem)]"><div className="overflow-hidden rounded-xl border border-rule bg-card shadow-premium"><div className="border-b border-rule/60 px-5 py-3"><div className="font-serif text-base">MailMyPDF Products</div><p className="mt-0.5 text-xs text-muted-foreground">Explore all MailMyPDF product verticals.</p></div><div className="grid gap-px bg-rule/20 sm:grid-cols-2">{ECOSYSTEM_PRODUCTS.map((p) => <a key={p.product} href={p.href} onClick={() => setOpen(false)} className="block bg-card px-4 py-3 transition-colors hover:bg-muted/40"><div className="font-medium text-sm text-foreground">{p.product}</div><div className="mt-0.5 text-xs leading-5 text-muted-foreground">{p.description}</div></a>)}</div><div className="flex items-center justify-between border-t border-rule bg-paper-deep/30 px-5 py-2.5"><a href={ECOSYSTEM_PAGE_URL} onClick={() => setOpen(false)} className="text-xs font-medium text-cobalt hover:text-cobalt/80">Explore all products →</a><div className="text-[10px] text-muted-foreground">{ECOSYSTEM_PRODUCTS.length} product families</div></div></div></div>}
  </div>;
}

export function SiteHeader({ variant = "default" }: { variant?: "default" | "transparent" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const transparent = variant === "transparent";
  const navItems = [
    { label: "How it works", href: "/#how" },
    { label: "What you can respond to", href: "/#workflows" },
    { label: "Pricing", href: "/pricing" },
    { label: "Resources", href: "/resources" },
    { label: "FAQ", href: "/faq" },
  ];

  const AccountLink = () => loading ? <span className={`ml-2 px-3 py-2 text-sm ${transparent ? "text-white/60" : "text-ink-soft"}`}>Account…</span> : user ? <><Link to="/dashboard" className={`ml-2 px-3 py-2 text-sm ${transparent ? "text-white/90" : "text-ink-soft"}`}>My cases</Link><button type="button" onClick={() => void signOut()} className={`px-3 py-2 text-sm ${transparent ? "text-white/80 hover:text-white" : "text-ink-soft hover:text-foreground"}`}>Sign out</button></> : <Link to="/auth" className={`ml-2 px-3 py-2 text-sm ${transparent ? "text-white/90" : "text-ink-soft"}`}>Sign in</Link>;

  return <header className={`sticky top-0 z-50 border-b transition-all ${transparent ? "border-transparent bg-transparent" : "border-rule/60 bg-paper/85 backdrop-blur-md"}`}><div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6"><Link to="/" className="flex items-center gap-2.5 group"><Logo /><span className={`font-serif text-lg leading-none transition-colors ${transparent ? "text-white group-hover:text-stamp-soft" : "group-hover:text-stamp"}`}>Notice Respond</span><span className={`hidden text-[10px] uppercase tracking-widest sm:inline ${transparent ? "text-white/50" : "text-muted-foreground"}`}>A MailMyPDF product</span></Link><div className="hidden items-center gap-1 md:flex"><WorkflowsDropdown transparent={transparent} />{navItems.map((item) => <a key={item.label} href={item.href} className={`px-3 py-2 text-sm ${transparent ? "text-white/80 hover:text-white" : "text-ink-soft hover:text-foreground"}`}>{item.label}</a>)}<AccountLink /><Link to="/workflows/irs-notice" className={`ml-2 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-transform hover:-translate-y-0.5 ${transparent ? "bg-stamp text-accent-foreground shadow-stamp" : "bg-primary text-primary-foreground shadow-stamp"}`}>Respond to a notice</Link></div><button className="flex h-9 w-9 items-center justify-center rounded-md border border-rule md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" aria-expanded={mobileOpen}>{mobileOpen ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>}</button></div>{mobileOpen && <div className="border-t border-rule bg-paper md:hidden"><div className="flex flex-col gap-1 px-4 py-3"><div className="mb-2"><div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Products</div><div className="grid gap-0.5">{ECOSYSTEM_PRODUCTS.map((p) => <a key={p.product} href={p.href} className="rounded-lg px-3 py-2.5 text-sm text-ink-soft hover:bg-muted/50 hover:text-foreground" onClick={() => setMobileOpen(false)}>{p.product}</a>)}</div></div>{navItems.map((item) => <a key={item.label} href={item.href} className="rounded-md px-3 py-2.5 text-sm font-medium text-ink-soft" onClick={() => setMobileOpen(false)}>{item.label}</a>)}{user ? <><Link to="/dashboard" className="rounded-md px-3 py-2.5 text-sm font-medium text-ink-soft" onClick={() => setMobileOpen(false)}>My cases</Link><button type="button" className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-ink-soft" onClick={() => { setMobileOpen(false); void signOut(); }}>Sign out</button></> : <Link to="/auth" className="rounded-md px-3 py-2.5 text-sm font-medium text-ink-soft" onClick={() => setMobileOpen(false)}>Sign in</Link>}<Link to="/workflows/irs-notice" className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground" onClick={() => setMobileOpen(false)}>Respond to a notice</Link></div></div>}</header>;
}
