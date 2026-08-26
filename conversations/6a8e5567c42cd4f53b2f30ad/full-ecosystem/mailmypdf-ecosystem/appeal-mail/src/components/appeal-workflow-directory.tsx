import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, CheckCircle2, ArrowRight } from "lucide-react";
import { workflows } from "@/domain/workflows";
import { getWorkflowHeroImage } from "@/domain/workflow-hero-images";

function categoryFor(slug: string): string {
  if (slug.includes("insurance") || slug.includes("claim") || slug.includes("medical") || slug.includes("authorization")) return "Insurance & Claims";
  if (slug.includes("ssdi") || slug.includes("ssi") || slug.includes("social-security") || slug.includes("medicaid") || slug.includes("unemployment") || slug.includes("edd")) return "Benefits & Government Programs";
  if (slug.includes("financial-aid") || slug.includes("sap") || slug.includes("scholarship") || slug.includes("fafsa")) return "Education & Financial Aid";
  if (slug.includes("license") || slug.includes("dmv") || slug.includes("registration")) return "Licensing & DMV";
  if (slug === "government-decision" || slug === "court-ruling" || slug === "reconsideration") return "General Appeals";
  return "Appeals";
}

export function AppealWorkflowDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const entries = Object.values(workflows);
  const categories = Array.from(new Set(entries.map((w) => categoryFor(w.id)))).sort();
  const filtered = useMemo(() => entries.filter((w) => {
    const haystack = [w.id, w.title, w.description, w.primaryKeyword || "", ...w.focusAreas].join(" ").toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (category === "ALL" || categoryFor(w.id) === category);
  }), [entries, query, category]);

  return <div>
    <div className="sticky top-14 z-30 border-b border-rule/60 bg-paper/85 backdrop-blur-md"><div className="mx-auto max-w-6xl px-4 py-4 sm:px-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search workflows — insurance, SSDI, financial aid, DMV…" className="w-full rounded-full border border-rule bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/10" /></div>
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-full border border-rule bg-card px-4 py-2.5 text-sm outline-none"><option value="ALL">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>
    </div><div className="mt-3 font-mono text-xs text-muted-foreground">{filtered.length} workflows • every workflow uses Understand → Build → Send</div></div></div>
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="space-y-12">{categories.filter((c) => category === "ALL" || c === category).map((cat) => { const items = filtered.filter((w) => categoryFor(w.id) === cat); if (!items.length) return null; return <section key={cat}><div className="mb-5 flex items-center gap-3"><h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{cat}</h3><span className="h-px flex-1 bg-rule/60" /><span className="font-mono text-xs text-muted-foreground">{items.length}</span></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((workflow) => {
        const img = getWorkflowHeroImage(workflow.id);
        return <Link key={workflow.id} to={`/workflows/${workflow.id}`} className="group flex h-full flex-col overflow-hidden rounded-xl border border-rule bg-card transition-all hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-md">
          {/* Image header */}
          {img && (
            <div className="relative h-32 overflow-hidden">
              <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(26,29,41,0.3) 0%, rgba(26,29,41,0.6) 100%)" }} />
              <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur-sm"><CheckCircle2 size={10} /> Available</div>
            </div>
          )}
          <div className="flex flex-1 flex-col p-5">
            {!img && (
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-full border border-rule bg-paper px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{cat}</span>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-stamp"><CheckCircle2 size={10} /> Available</span>
              </div>
            )}
            <h3 className="mt-1 font-serif text-2xl leading-tight">{workflow.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{workflow.description}</p>
            <div className="mt-4 border-t border-rule/60 pt-4"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Primary search intent</div><div className="mt-1 text-sm font-medium">{workflow.primaryKeyword || "Specialized appeal response"}</div></div>
            <div className="mt-4 flex items-center justify-between"><span className="text-sm font-medium text-stamp">Start workflow</span><ArrowRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-1" /></div>
          </div>
        </Link>;
      })}</div></section>; })}</div>
    </div>
  </div>;
}
