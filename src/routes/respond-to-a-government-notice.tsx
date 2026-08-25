import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { NOTICE_WORKFLOWS } from "@/components/notice-workflow-directory";
import { AuthorityWorkflowHead, AuthorityWorkflowPage, AuthorityWorkflowStructuredData } from "@/components/notice-authority-workflow-page";

const workflow = NOTICE_WORKFLOWS.find((item) => item.slug === "government-notice")!;

export const Route = createFileRoute("/respond-to-a-government-notice")({
  head: () => ({ ...AuthorityWorkflowHead({ workflow }), links: [{ rel: "canonical", href: "/respond-to-a-government-notice" }], scripts: [AuthorityWorkflowStructuredData({ workflow })] }),
  component: () => <><SiteHeader /><AuthorityWorkflowPage workflow={workflow} /><SiteFooter /></>,
});
