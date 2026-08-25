import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { NOTICE_WORKFLOWS } from "@/components/notice-workflow-directory";
import { AuthorityWorkflowHead, AuthorityWorkflowPage, AuthorityWorkflowStructuredData } from "@/components/notice-authority-workflow-page";

const workflow = { ...NOTICE_WORKFLOWS.find((item) => item.slug === "code-enforcement")!, canonicalPath: "/workflows/analyze" };
export const Route = createFileRoute("/workflows/respond-to-code-enforcement-notice")({
  head: () => ({ ...AuthorityWorkflowHead({ workflow }), links: [{ rel: "canonical", href: "/workflows/respond-to-code-enforcement-notice" }], scripts: [AuthorityWorkflowStructuredData({ workflow })] }),
  component: () => <><SiteHeader /><AuthorityWorkflowPage workflow={workflow} /><SiteFooter /></>,
});
