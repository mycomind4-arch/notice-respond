import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign In — Notice Respond" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid overflow-hidden rounded-2xl border border-rule md:grid-cols-2">
          <div className="p-8 md:p-10" style={{ background: "linear-gradient(135deg, oklch(0.25 0.04 240) 0%, oklch(0.2 0.035 240) 100%)" }}>
            <div className="postmark w-fit" style={{ borderColor: "rgba(16,185,129,.2)", color: "oklch(0.72 0.08 160)", background: "rgba(16,185,129,.05)" }}>Notice Respond</div>
            <h1 className="mt-8 font-serif text-3xl text-white">Your responses, organized and sent.</h1>
            <p className="mt-4 text-sm leading-7 text-white/60">Create an account to save drafts, track responses, and keep a permanent record of your correspondence.</p>
            <ul className="mt-8 space-y-3">{["Save and resume workflows", "Track all responses in one place", "Keep proof of timely submission", "Re-use recipient addresses"].map((item) => (<li key={item} className="flex items-center gap-2 text-sm text-white/70"><svg className="h-4 w-4 text-stamp-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{item}</li>))}</ul>
          </div>
          <div className="flex flex-col justify-center bg-card p-8 md:p-10">
            {submitted ? (
              <div className="text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stamp/10"><svg className="h-8 w-8 text-stamp" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div><h2 className="mt-5 font-serif text-2xl">You're on the list!</h2><p className="mt-3 text-sm text-muted-foreground">We'll notify you at <span className="font-medium text-foreground">{email}</span> when accounts launch.</p><Link to="/" className="mt-6 inline-flex items-center rounded-full border border-input px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted">Back to home</Link></div>
            ) : (
              <>
                <h2 className="font-serif text-2xl">Authentication coming soon</h2>
                <p className="mt-2 text-sm text-muted-foreground">Enter your email to be notified when accounts launch.</p>
                <label className="input-label mt-5">Email address</label><input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                <button onClick={() => email.trim() && setSubmitted(true)} disabled={!email.trim()} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5 disabled:opacity-30 disabled:transform-none disabled:shadow-none">Notify me →</button>
                <p className="mt-5 text-xs text-muted-foreground">By continuing, you agree to our <Link to="/terms" className="text-stamp hover:underline">Terms</Link> and <Link to="/privacy" className="text-stamp hover:underline">Privacy Policy</Link>.</p>
              </>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
