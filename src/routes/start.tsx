import { createFileRoute, redirect } from "@tanstack/react-router";
import { safeReturnTo } from "@/lib/use-start-workflow-guard";

export const Route = createFileRoute("/start")({
  beforeLoad: ({ search }) => {
    const rawReturnTo = (search as { returnTo?: string })?.returnTo;
    if (rawReturnTo) {
      // Validate returnTo to prevent open-redirect attacks
      const returnTo = safeReturnTo(rawReturnTo);
      throw redirect({ to: "/auth", search: { returnTo } });
    }
    throw redirect({ to: "/workflows" });
  },
  component: () => null,
});
