import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NarrationButton, VoiceBadge } from "@/components/voice-controls";
import { buildScript, createSegment } from "@/domain/voice";
import { getRepository } from "@/platform/repository";
import { getOwnerId } from "@/platform/owner-context";
import type { CaseSummary } from "@/domain/notice";
import { NOTICE_TYPE_META } from "@/domain/notice-type";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "My Cases — Notice Respond" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: DashboardPage,
});

const STATUS_BADGE: Record<string, string> = {
  intake: "text-muted-foreground",
  analyzed: "text-stamp",
  in_progress: "text-stamp",
  ready: "text-emerald-700",
  mailed: "text-stamp",
  delivered: "text-emerald-700",
  closed: "text-muted-foreground",
  archived: "text-muted-foreground",
};

const STATUS_LABEL: Record<string, string> = {
  intake: "Intake",
  analyzed: "Analyzed",
  in_progress: "In Progress",
  ready: "Ready",
  mailed: "Mailed",
  delivered: "Delivered",
  closed: "Closed",
  archived: "Archived",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function DashboardPage() {
  const [summaries, setSummaries] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const repo = getRepository();
    repo
      .listSummaries(getOwnerId())
      .then((data) => {
        setSummaries(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Compute stats from real data
  const stats = useMemo(() => {
    const total = summaries.length;
    const inProgress = summaries.filter((s) => s.status === "in_progress" || s.status === "analyzed").length;
    const ready = summaries.filter((s) => s.status === "ready").length;
    const mailed = summaries.filter((s) => s.status === "mailed" || s.status === "delivered").length;
    const withDrafts = summaries.filter((s) => s.hasDraft).length;

    return [
      { label: "Total cases", value: String(total) },
      { label: "In progress", value: String(inProgress) },
      { label: "Ready to mail", value: String(ready) },
      { label: "With drafts", value: String(withDrafts) },
    ];
  }, [summaries]);

  const summaryScript = buildScript("summary", "Dashboard Summary", [
    createSegment("Your case dashboard.", "heading", { pauseAfter: 500 }),
    createSegment(
      `You have ${summaries.length} total cases. ${stats[1].value} in progress, ${stats[2].value} ready to mail.`,
      "body",
      { pauseAfter: 400 },
    ),
    createSegment("To analyze a new notice, click the Analysis Studio button.", "instruction", { pauseAfter: 500 }),
  ]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="postmark w-fit">My Cases</div>
              <VoiceBadge active={true} />
            </div>
            <h1 className="mt-3 font-serif text-4xl">Your case records</h1>
            <p className="mt-1 text-sm text-muted-foreground">Track your notice responses and case status.</p>
          </div>
          <div className="flex items-center gap-3">
            <NarrationButton script={summaryScript} label="Listen to summary" />
            <Link to="/workflows/analyze" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5">
              Analysis Studio <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="envelope-card p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
              <div className="mt-2 text-2xl font-serif">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Cases table */}
        <div className="mt-8 envelope-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-rule/60 px-5 py-4">
            <h2 className="font-serif text-lg">Recent cases</h2>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Loading cases…
            </div>
          ) : summaries.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-muted-foreground">No saved cases yet.</p>
              <Link to="/workflows/analyze" className="mt-3 inline-flex items-center gap-2 rounded-full border border-stamp px-4 py-2 text-sm font-medium text-stamp transition-colors hover:bg-stamp hover:text-accent-foreground">
                Analyze your first notice
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead className="bg-paper-deep/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Type</th>
                      <th className="px-5 py-3 font-medium">Agency</th>
                      <th className="px-5 py-3 font-medium">Reference</th>
                      <th className="px-5 py-3 font-medium">Deadline</th>
                      <th className="px-5 py-3 font-medium">Readiness</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule/40">
                    {summaries.map((s) => (
                      <tr key={s.id} className="hover:bg-paper-deep/20 transition-colors cursor-pointer">
                        <td className="px-5 py-3.5 text-ink-soft">
                          {(NOTICE_TYPE_META as Record<string, { label?: string }>)[s.noticeType]?.label || s.noticeType}
                        </td>
                        <td className="px-5 py-3.5 text-ink-soft">{s.agency || "—"}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{s.referenceNumber || "—"}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {s.deadlineDate ? formatDate(s.deadlineDate) : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${s.readinessScore}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{s.readinessScore}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`font-mono text-xs ${STATUS_BADGE[s.status] || "text-muted-foreground"}`}>
                            {STATUS_LABEL[s.status] || s.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">{formatDate(s.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-rule/40 md:hidden">
                {summaries.map((s) => (
                  <div key={s.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">
                        {(NOTICE_TYPE_META as Record<string, { label?: string }>)[s.noticeType]?.label || s.noticeType}
                      </span>
                      <span className={`font-mono text-xs ${STATUS_BADGE[s.status] || "text-muted-foreground"}`}>
                        {STATUS_LABEL[s.status] || s.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.agency || "Unknown agency"}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDate(s.updatedAt)}</span>
                      {s.deadlineDate && <><span>·</span><span>Deadline: {formatDate(s.deadlineDate)}</span></>}
                      <span>·</span>
                      <span>{s.readinessScore}% ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-md border border-dashed border-rule bg-paper-deep/30 px-5 py-4 text-sm text-muted-foreground">
          <svg className="h-5 w-5 shrink-0 text-stamp" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" /></svg>
          <span>Cases are automatically saved as you work. Connect Supabase to persist cases across sessions.</span>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
