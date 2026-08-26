import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { createSubscriptionCheckout, checkSubscriptionStatus, cancelSubscription } from "@/lib/subscriptions.functions";
import { PRO_FREE_LETTERS_PER_MONTH, PRO_MEMBER_RATE_CENTS, PRO_MONTHLY_PRICE_CENTS } from "@/lib/subscriptions";
import { mailClassSurchargeLabel, colorPerPageLabel } from "@/lib/pricing";

export const Route = createFileRoute("/pro")({
  head: () => ({
    meta: [
      { title: "MailMyPDF Pro — 5 free letters/month for $9.99/mo" },
      { name: "description", content: "MailMyPDF Pro members get 5 free standard letters every month, discounted rates on additional letters, and all the same great features. Cancel anytime." },
    ],
  }),
  component: ProPage,
});

function ProPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState("");

  const monthlyPrice = `$${(PRO_MONTHLY_PRICE_CENTS / 100).toFixed(2)}`;
  const memberRate = `$${(PRO_MEMBER_RATE_CENTS / 100).toFixed(2)}`;

  async function checkStatus() {
    if (!email) return;
    setError("");
    try {
      const result = await checkSubscriptionStatus({ data: { email } });
      if ("error" in (result as any)) {
        setError((result as any).error);
      } else {
        setStatus(result);
      }
    } catch (e) {
      setError("Could not check subscription status.");
    }
  }

  async function subscribe() {
    if (!email) {
      setError("Enter your email to subscribe.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await createSubscriptionCheckout({ data: { email } });
      if ("error" in result) {
        setError(result.error);
        setLoading(false);
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch (e) {
      setError("Could not start checkout. Please try again.");
      setLoading(false);
    }
  }

  async function cancel() {
    if (!email) return;
    if (!confirm("Cancel your MailMyPDF Pro subscription?")) return;
    setLoading(true);
    setError("");
    try {
      const result = await cancelSubscription({ data: { email } });
      if ("error" in result) {
        setError(result.error);
      } else {
        setStatus(null);
        alert("Subscription canceled. Your benefits remain active until the end of the billing period.");
      }
    } catch (e) {
      setError("Could not cancel subscription.");
    }
    setLoading(false);
  }

  const benefits = [
    { icon: "✉️", title: `${PRO_FREE_LETTERS_PER_MONTH} free letters every month`, desc: "Standard letters (up to 5 pages, B&W) included. No rollover — use them or lose them." },
    { icon: "💰", title: `Only ${memberRate} per letter after that`, desc: "Flat member rate for any letter up to 10 pages. No tier pricing." },
    { icon: "🎨", title: "Color printing still available", desc: `${colorPerPageLabel()} per page when you need it.` },
    { icon: "📋", title: "Certified & Registered mail", desc: `Add Certified (${mailClassSurchargeLabel("certified")}) or Registered (${mailClassSurchargeLabel("registered")}) at normal rates.` },
    { icon: "🚫", title: "Cancel anytime", desc: "No commitment. Cancel in one click. Benefits last until your billing period ends." },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-rule/60 bg-gradient-to-b from-stamp/5 to-transparent">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-stamp/10 px-4 py-1.5 text-sm font-medium text-stamp">
            MailMyPDF Pro
          </div>
          <h1 className="font-serif text-5xl font-bold tracking-tight">
            {monthlyPrice}<span className="text-2xl text-muted-foreground">/month</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            {PRO_FREE_LETTERS_PER_MONTH} free letters every month. Discounted rates after that. Same print-and-mail service, better price.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map((b) => (
            <div key={b.title} className="envelope-card flex gap-3 p-5">
              <span className="text-2xl">{b.icon}</span>
              <div>
                <h3 className="font-medium">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subscribe / Manage */}
      <section className="mx-auto max-w-md px-6 py-12">
        {status?.isActive ? (
          <div className="envelope-card p-6 text-center">
            <h2 className="font-serif text-2xl font-bold text-stamp">You're a Pro member</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Letters used this period</span>
                <span className="font-medium">{status.lettersUsedThisPeriod} / {status.freeLettersPerMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining free letters</span>
                <span className="font-medium text-stamp">{status.lettersRemaining}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate after free tier</span>
                <span className="font-medium">${(status.memberRateCents / 100).toFixed(2)}/letter</span>
              </div>
              {status.currentPeriodEnd && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current period ends</span>
                  <span className="font-medium">{new Date(status.currentPeriodEnd * 1000).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <button
              onClick={cancel}
              disabled={loading}
              className="mt-6 w-full rounded-md border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
            >
              {loading ? "Canceling..." : "Cancel subscription"}
            </button>
          </div>
        ) : (
          <div className="envelope-card p-6">
            <h2 className="font-serif text-2xl font-bold text-center">Subscribe to Pro</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Enter your email to get started. Secure checkout via Stripe.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-4 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            <button
              onClick={subscribe}
              disabled={loading}
              className="mt-4 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Redirecting to Stripe..." : `Subscribe — ${monthlyPrice}/month`}
            </button>
            <button
              onClick={checkStatus}
              className="mt-2 w-full text-center text-xs text-muted-foreground hover:underline"
            >
              Already a member? Check your status
            </button>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-6 py-12">
        <h2 className="font-serif text-2xl font-bold mb-6">Pro FAQ</h2>
        <div className="space-y-4">
          <details className="envelope-card p-4">
            <summary className="cursor-pointer font-medium">What counts as a "free letter"?</summary>
            <p className="mt-2 text-sm text-muted-foreground">Standard letters up to 5 pages, black & white, standard delivery. Add-ons like color printing, Certified Mail, and Registered Mail are charged at normal rates even for Pro members.</p>
          </details>
          <details className="envelope-card p-4">
            <summary className="cursor-pointer font-medium">Do unused letters roll over?</summary>
            <p className="mt-2 text-sm text-muted-foreground">No — your {PRO_FREE_LETTERS_PER_MONTH} free letters reset at the start of each billing period. Use them or lose them.</p>
          </details>
          <details className="envelope-card p-4">
            <summary className="cursor-pointer font-medium">What if I send more than {PRO_FREE_LETTERS_PER_MONTH} letters?</summary>
            <p className="mt-2 text-sm text-muted-foreground">After your free letters, each letter costs a flat {memberRate} (up to 10 pages). Color, certified, and registered add-ons are extra.</p>
          </details>
          <details className="envelope-card p-4">
            <summary className="cursor-pointer font-medium">Can I cancel anytime?</summary>
            <p className="mt-2 text-sm text-muted-foreground">Yes. Cancel in one click from this page. Your Pro benefits stay active until the end of your current billing period.</p>
          </details>
        </div>
      </section>
    </div>
  );
}
