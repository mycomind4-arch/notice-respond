import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { NOTICE_WORKFLOWS, WorkflowHead, WorkflowPage, WorkflowStructuredData } from "@/components/notice-workflow-directory";

const workflow = NOTICE_WORKFLOWS.find((item) => item.slug === "tax-notice")!;
export const Route = createFileRoute("/workflows/respond-to-a-tax-notice")({
  head: () => ({ ...WorkflowHead({ workflow }), links: [{ rel: "canonical", href: "/workflows/respond-to-a-tax-notice" }], scripts: [WorkflowStructuredData({ workflow })] }),
  component: () => <><SiteHeader /><WorkflowPage workflow={workflow} /><SiteFooter /></>,
});
