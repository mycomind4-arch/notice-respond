import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "MailMyPDF Account — Notice Respond" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "magic" | "reset";

function AuthPage() {
  const { user, loading, isConfigured, signIn, signUp, signInWithMagicLink, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <div className="min-h-screen"><SiteHeader /><main className="mx-auto max-w-3xl px-6 py-24 text-center"><p className="text-sm text-muted-foreground">Loading MailMyPDF Account…</p></main><SiteFooter /></div>;
  if (user) return <div className="min-h-screen"><SiteHeader /><main className="mx-auto max-w-3xl px-6 py-24 text-center"><div className="postmark mx-auto w-fit">MailMyPDF Account</div><h1 className="mt-6 font-serif text-4xl">You're already signed in.</h1><p className="mt-3 text-sm text-muted-foreground">Continue to your Notice Respond cases or manage your account.</p><div className="mt-8 flex justify-center gap-3"><Link to="/dashboard" className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">My cases</Link><Link to="/" className="rounded-full border border-input px-6 py-3 text-sm font-medium">Home</Link></div></main><SiteFooter /></div>;

  const submit = async () => {
    setError(null); setMessage(null);
    if (!email.trim()) return setError("Enter your email address.");
    if (mode !== "magic" && mode !== "reset" && password.length < 8) return setError("Password must be at least 8 characters.");
    const result = mode === "signup"
      ? await signUp(email.trim(), password)
      : mode === "magic"
        ? await signInWithMagicLink(email.trim())
        : mode === "reset"
          ? await resetPassword(email.trim())
          : await signIn(email.trim(), password);
    if (result.error) setError(result.error);
    else setMessage(result.needsConfirmation ? "Check your email to confirm your MailMyPDF Account." : mode === "reset" ? "Password reset instructions sent." : mode === "magic" ? "Magic-link instructions sent." : "Signed in successfully.");
  };

  return <div className="min-h-screen"><SiteHeader /><main className="mx-auto max-w-4xl px-6 py-14"><div className="grid overflow-hidden rounded-2xl border border-rule md:grid-cols-2"><div className="bg-primary p-8 text-primary-foreground md:p-10"><div className="postmark w-fit border-white/20 bg-white/5 text-white">Notice Respond</div><h1 className="mt-8 font-serif text-3xl">A MailMyPDF product, one account.</h1><p className="mt-4 text-sm leading-7 text-white/75">Use your MailMyPDF Account to save cases, documents, drafts, mailing history, and future MailMyPDF products in one place.</p><ul className="mt-8 space-y-3">{["Save and resume Notice Respond workflows", "Track responses and mailing records", "Keep proof and case history together", "Use one account across the MailMyPDF ecosystem"].map((item) => <li key={item} className="flex items-center gap-2 text-sm text-white/80">✓ {item}</li>)}</ul></div><div className="bg-card p-8 md:p-10"><div className="mb-6 flex flex-wrap gap-2 text-sm">{(["signin","signup","magic","reset"] as Mode[]).map((m) => <button key={m} onClick={() => { setMode(m); setMessage(null); setError(null); }} className={`rounded-full px-4 py-2 ${mode === m ? "bg-primary text-primary-foreground" : "border border-input"}`}>{m === "signin" ? "Sign in" : m === "signup" ? "Create account" : m === "magic" ? "Magic link" : "Reset"}</button>)}</div>{!isConfigured && <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">MailMyPDF Account is not configured in this environment yet.</div>}{error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}{message && <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}<label className="input-label">Email address</label><input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />{mode !== "magic" && mode !== "reset" && <><label className="input-label mt-4">Password</label><input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={mode === "signup" ? "new-password" : "current-password"} /></>}<button onClick={submit} disabled={!isConfigured} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp disabled:opacity-40">{mode === "signin" ? "Sign in" : mode === "signup" ? "Create MailMyPDF Account" : mode === "magic" ? "Send magic link" : "Send reset instructions"} →</button><p className="mt-5 text-xs text-muted-foreground">By continuing, you agree to our <Link to="/terms" className="text-stamp hover:underline">Terms</Link> and <Link to="/privacy" className="text-stamp hover:underline">Privacy Policy</Link>.</p></div></div></main><SiteFooter /></div>;
}
