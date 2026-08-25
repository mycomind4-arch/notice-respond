import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NOTICE_WORKFLOWS } from "@/components/notice-workflow-directory";

export const Route = createFileRoute("/workflows/")({
  head: () => ({
    meta: [
      { title: "Workflows — Notice Respond" },
      { name: "description", content: "Browse all Notice Respond workflows for government notices, agency actions, and formal responses." },
    ],
  }),
  component: () => (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="eyebrow">Workflows</div>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Find your workflow</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Select the type of notice or document you need to respond to. Each workflow guides you through preparation and mailing.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NOTICE_WORKFLOWS.map((w) => (
            <a
              key={w.slug}
              href={`/workflows/${w.slug}`}
              className="block rounded-2xl border border-rule bg-paper-deep/30 p-6 transition-colors hover:bg-muted/40"
            >
              <h2 className="font-serif text-xl">{w.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{w.description}</p>
            </a>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  ),
});
