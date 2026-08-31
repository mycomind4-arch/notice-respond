import { createFileRoute } from "@tanstack/react-router";
import { SeoLandingPage, DEFAULT_FAQ_LIST, faqJsonLd } from "@/components/seo-landing";
import { relatedFor } from "@/lib/seo-pages";

const PATH = "/send-a-letter-without-a-printer";
const TITLE = "Send a Letter Without a Printer | MailMyPDF";
const DESC = "No printer? No problem. Upload your PDF and MailMyPDF will print, stamp, and mail your letter for you.";

export const Route = createFileRoute("/send-a-letter-without-a-printer")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: PATH },
    ],
    links: [{ rel: "canonical", href: PATH }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(faqJsonLd(DEFAULT_FAQ_LIST)) }],
  }),
  component: () => (
    <SeoLandingPage
      eyebrow="No printer required"
      h1="Send a letter without a printer"
      intro="If you need to mail a document but don't have access to a printer, MailMyPDF handles the printing and mailing for you."
      whatYouCanSend={{
        items: [
          "Job applications and cover letters",
          "Notice letters to a landlord",
          "Tax correspondence",
          "Insurance and appeal letters",
          "Cancellation notices",
          "Signed agreements",
        ],
      }}
      relatedLinks={relatedFor(PATH)}
    />
  ),
});
