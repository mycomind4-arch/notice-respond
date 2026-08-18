import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NOTICE_WORKFLOWS, WorkflowPage, WorkflowHead, WorkflowStructuredData } from "@/components/notice-workflow-directory";

const workflow = NOTICE_WORKFLOWS.find((w) => w.slug === "cp2000-response")!;

export const Route = createFileRoute("/workflows/respond-to-cp2000-notice")({
  head: () => ({
    ...WorkflowHead({ workflow }),
    links: [{ rel: "canonical", href: "/workflows/respond-to-cp2000-notice" }],
    scripts: [WorkflowStructuredData({ workflow })],
  }),
  component: () => (
    <>
      <SiteHeader />
      <WorkflowPage workflow={workflow} />
      <SiteFooter />
    </>
  ),
});
