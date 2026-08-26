import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AppealWorkflowPage } from "@/components/appeal-workflow-page";
import {
  getWorkflowBySlug,
  getCategoryBySlug,
  getWorkflowsByCategory,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_SLUGS,
  CATEGORY_ORDER,
  type AppealCategory,
} from "@/domain/appeal-catalog";

export const Route = createFileRoute("/appeal/$slug")({
  head: ({ params }) => {
    const { slug } = params;

    // Check if this is a category page
    const category = getCategoryBySlug(slug);
    if (category) {
      const workflows = getWorkflowsByCategory(category);
      const seoTitle = `${category} Appeals — Appeal Mail`;
      const seoDescription = `Browse ${workflows.length} ${category.toLowerCase()} appeal workflows. ${CATEGORY_DESCRIPTIONS[category]}`;
      return {
        meta: [
          { title: seoTitle },
          { name: "description", content: seoDescription },
          { property: "og:title", content: seoTitle },
          { property: "og:description", content: seoDescription },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary" },
          { name: "twitter:title", content: seoTitle },
          { name: "twitter:description", content: seoDescription },
        ],
        links: [{ rel: "canonical", href: `/appeal/${slug}` }],
        scripts: [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: `${category} Appeals`,
              description: seoDescription,
              hasPart: workflows.map((w) => ({
                "@type": "WebPage",
                name: w.title,
                url: w.route,
              })),
            }),
          },
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "/" },
                { "@type": "ListItem", position: 2, name: "Appeals", item: "/appeal" },
                { "@type": "ListItem", position: 3, name: `${category} Appeals`, item: `/appeal/${slug}` },
              ],
            }),
          },
        ],
      };
    }

    // Check if this is a workflow page
    const workflow = getWorkflowBySlug(slug);
    if (!workflow) {
      return {
        meta: [
          { title: "Appeal type not found — Appeal Mail" },
          { name: "description", content: "This appeal type does not exist." },
        ],
      };
    }
    return {
      meta: [
        { title: workflow.seoTitle },
        { name: "description", content: workflow.seoDescription },
        { property: "og:title", content: workflow.seoTitle },
        { property: "og:description", content: workflow.seoDescription },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: workflow.seoTitle },
        { name: "twitter:description", content: workflow.seoDescription },
      ],
      links: [{ rel: "canonical", href: workflow.route }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: workflow.title,
            description: workflow.seoDescription,
            about: workflow.primaryKeyword,
            isPartOf: {
              "@type": "WebSite",
              name: "Appeal Mail",
              url: "/",
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Appeals", item: "/appeal" },
              { "@type": "ListItem", position: 3, name: workflow.title, item: workflow.route },
            ],
          }),
        },
      ],
    };
  },
  component: AppealSlugPage,
  notFoundComponent: () => null,
});

function AppealSlugPage() {
  const { slug } = Route.useParams();

  // Check if this is a category page
  const category = getCategoryBySlug(slug);
  if (category) {
    return <CategoryPage category={category} />;
  }

  // Check if this is a workflow page
  const workflow = getWorkflowBySlug(slug);
  if (!workflow) {
    throw redirect({ to: "/workflows" });
  }

  return <AppealWorkflowPage workflow={workflow} />;
}

function CategoryPage({ category }: { category: AppealCategory }) {
  const workflows = getWorkflowsByCategory(category);
  const implemented = workflows.filter((w) => w.status === "IMPLEMENTED");
  const comingSoon = workflows.filter((w) => w.status === "COMING_SOON");

  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-rule/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            to="/workflows"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-stamp"
          >
            <ArrowLeft size={15} /> All appeal types
          </Link>
          <div className="mt-5 flex items-center gap-3">
            <span className="rounded-full border border-rule bg-paper-deep px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Category
            </span>
          </div>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-ink md:text-5xl lg:text-6xl">
            {category} Appeals
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-muted-foreground">
            {CATEGORY_DESCRIPTIONS[category]}
          </p>
          <div className="mt-6 flex gap-6 font-mono text-sm text-muted-foreground">
            <span>{workflows.length} workflows</span>
            {implemented.length > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-stamp" /> {implemented.length} available
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={12} /> {comingSoon.length} coming soon
            </span>
          </div>
        </div>
      </section>

      {/* Workflow list */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Link
                key={workflow.slug}
                to={workflow.route}
                className="group flex h-full flex-col rounded-xl border border-rule bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  {workflow.status === "IMPLEMENTED" ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-stamp" style={{ background: "color-mix(in oklab, var(--stamp) 8%, transparent)" }}>
                      <CheckCircle2 size={10} /> Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-paper-deep px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      <Clock size={10} /> Coming soon
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-serif text-2xl leading-tight">{workflow.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{workflow.shortDescription}</p>
                <div className="mt-auto pt-4">
                  <span className="text-sm font-medium text-stamp">{workflow.cta}</span>
                  <span className="ml-2 text-muted-foreground transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Other categories */}
          <div className="mt-16 border-t border-rule/60 pt-8">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Other categories</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORY_ORDER.filter((c) => c !== category).map((cat) => (
                <Link
                  key={cat}
                  to="/appeal/$slug"
                  params={{ slug: CATEGORY_SLUGS[cat] }}
                  className="rounded-full border border-rule bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-ink/30 hover:text-foreground"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
