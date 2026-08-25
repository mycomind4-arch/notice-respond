import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mail-a-pdf")({
  beforeLoad: () => {
    throw redirect({ href: "https://mailmypdf.ai/mail-a-pdf" });
  },
  component: () => null,
});
