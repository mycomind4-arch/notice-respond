import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/admin",
  }),
  head: () => ({
    meta: [{ title: "Sign in — MailMyPDF" }, { name: "robots", content: "noindex" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    navigate({ to: redirect as "/admin" });
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-24">
        <div className="postmark w-fit">Staff sign in</div>
        <h1 className="mt-4 font-serif text-4xl">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is for MailMyPDF staff only. Customers don't need an account — track your order at{" "}
          <a href="/orders" className="underline">/orders</a>.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm" />
          </div>
          {error && <div className="text-sm text-red-700">{error}</div>}
          <button disabled={loading} type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground disabled:opacity-60">
            {loading ? "Working…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-xs text-muted-foreground">
          Staff accounts are created by an administrator. If you need access, contact your admin.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
