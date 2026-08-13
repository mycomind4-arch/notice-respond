import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "My Mailings — Notice Respond" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: DashboardPage,
});

const stats = [
  { label: "Total responses", value: "5" },
  { label: "In transit", value: "1" },
  { label: "Delivered", value: "4" },
  { label: "Avg. delivery", value: "4.2 days" },
];

const mailings = [
  { id: "NR-2026-0052", type: "IRS Notice Response", recipient: "IRS — Department of the Treasury", date: "Aug 11, 2026", status: "in_transit", mailType: "Certified" },
  { id: "NR-2026-0044", type: "Court Summons Response", recipient: "Superior Court of California", date: "Aug 2, 2026", status: "delivered", mailType: "Certified" },
  { id: "NR-2026-0038", type: "Agency Action Response", recipient: "State Licensing Board", date: "Jul 20, 2026", status: "delivered", mailType: "Registered" },
  { id: "NR-2026-0031", type: "Appeal Filing", recipient: "Social Security Administration", date: "Jul 8, 2026", status: "delivered", mailType: "Certified" },
  { id: "NR-2026-0024", type: "IRS Notice Response", recipient: "IRS — Austin, TX", date: "Jun 15, 2026", status: "delivered", mailType: "Certified" },
];

const statusBadge: Record<string, string> = { in_transit: "text-stamp", delivered: "text-emerald-700" };

function DashboardPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="postmark w-fit">My Mailings</div>
            <h1 className="mt-3 font-serif text-4xl">Your response records</h1>
            <p className="mt-1 text-sm text-muted-foreground">Track your notice responses and delivery records.</p>
          </div>
          <Link to="/workflows/irs-notice" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5">
            Respond to a notice <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (<div key={s.label} className="envelope-card p-5"><div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div><div className="mt-2 text-2xl font-serif">{s.value}</div></div>))}
        </div>

        <div className="mt-8 envelope-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-rule/60 px-5 py-4"><h2 className="font-serif text-lg">Recent responses</h2></div>
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-paper-deep/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-5 py-3 font-medium">Reference</th><th className="px-5 py-3 font-medium">Type</th><th className="px-5 py-3 font-medium">Recipient</th><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 font-medium">Mail type</th><th className="px-5 py-3 font-medium">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-rule/40">
                {mailings.map((m) => (<tr key={m.id} className="hover:bg-paper-deep/20 transition-colors cursor-pointer"><td className="px-5 py-3.5 font-mono text-xs font-medium text-foreground">{m.id}</td><td className="px-5 py-3.5 text-ink-soft">{m.type}</td><td className="px-5 py-3.5 text-ink-soft">{m.recipient}</td><td className="px-5 py-3.5 text-muted-foreground">{m.date}</td><td className="px-5 py-3.5 text-muted-foreground">{m.mailType}</td><td className="px-5 py-3.5"><span className={`font-mono text-xs ${statusBadge[m.status]}`}>{m.status}</span></td></tr>))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-rule/40 md:hidden">
            {mailings.map((m) => (<div key={m.id} className="p-4"><div className="flex items-center justify-between"><span className="font-mono text-xs font-medium text-foreground">{m.id}</span><span className={`font-mono text-xs ${statusBadge[m.status]}`}>{m.status}</span></div><p className="mt-2 font-medium text-foreground">{m.type}</p><p className="mt-1 text-sm text-muted-foreground">{m.recipient}</p><div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground"><span>{m.date}</span><span>·</span><span>{m.mailType}</span></div></div>))}
          </div>
        </div>

        <div className="mt-6 envelope-card p-5">
          <div className="flex items-center gap-2"><svg className="h-5 w-5 text-stamp" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg><h2 className="font-serif text-lg">Latest tracking</h2></div>
          <p className="mt-1 text-sm text-muted-foreground">NR-2026-0052 · Certified Mail</p>
          <div className="mt-4 space-y-4">
            {[{ date: "Aug 12, 9:30 AM", event: "Mailed from Los Angeles, CA", done: true }, { date: "Aug 12, 2:15 PM", event: "Processed at USPS facility", done: true }, { date: "Aug 13", event: "In transit", done: false }, { date: "—", event: "Delivered (signature required)", done: false }].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${step.done ? "bg-stamp/10" : "border border-rule bg-card"}`}>
                  {step.done ? <svg className="h-3.5 w-3.5 text-stamp" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <span className="text-[10px] font-mono text-muted-foreground">{i + 1}</span>}
                </div>
                <div><p className={`text-sm ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.event}</p><p className="text-xs text-muted-foreground">{step.date}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-md border border-dashed border-rule bg-paper-deep/30 px-5 py-4 text-sm text-muted-foreground">
          <svg className="h-5 w-5 shrink-0 text-stamp" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" /></svg>
          <span>Account features (save drafts, re-send, saved addresses) are coming when authentication launches.</span>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
