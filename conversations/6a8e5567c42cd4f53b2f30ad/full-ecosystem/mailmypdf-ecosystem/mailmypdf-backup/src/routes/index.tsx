import { createFileRoute, Link } from "@tanstack/react-router";
import { mailClassSurchargeLabel, mailClassSurchargeUsd, colorPerPageLabel, colorPerPageUsd } from "@/lib/pricing";
import { PRO_FREE_LETTERS_PER_MONTH, PRO_MEMBER_RATE_CENTS, PRO_MONTHLY_PRICE_CENTS } from "@/lib/subscriptions";
import { SiteFooter, SiteHeader, Logo } from "@/components/site-chrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MailMyPDF — Mail a letter or PDF without a printer" },
      { name: "description", content: "Upload a PDF or write a letter in your browser. We print, stamp, and mail it via USPS. Color printing, certified mail, templates, and future-self letters. From $4.99." },
      { property: "og:title", content: "MailMyPDF — Mail a letter or PDF without a printer" },
      { property: "og:description", content: "Upload a PDF or write a letter online. Color printing, certified mail, 20+ templates. From $4.99." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "MailMyPDF",
          description: "Print-and-mail service: upload a PDF or write a letter online. We print, stamp, and mail it via USPS with color printing, certified mail, and scheduled delivery options.",
          areaServed: "US",
          offers: [
            { "@type": "Offer", name: "Short letter (1–2 pages)", price: "4.99", priceCurrency: "USD" },
            { "@type": "Offer", name: "Medium letter (3–5 pages)", price: "6.99", priceCurrency: "USD" },
            { "@type": "Offer", name: "Long letter (6–10 pages)", price: "9.99", priceCurrency: "USD" },
            { "@type": "Offer", name: "Color printing add-on", price: colorPerPageUsd(), priceCurrency: "USD" },
            { "@type": "Offer", name: "Certified Mail add-on", price: mailClassSurchargeUsd("certified"), priceCurrency: "USD" },
            { "@type": "Offer", name: "Registered Mail add-on", price: mailClassSurchargeUsd("registered"), priceCurrency: "USD" },
          ],
        }),
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Hero />
      <WhatsNew />
      <DualPath />
      <HowItWorks />
      <Pricing />
      <ProPlan />
      <Templates />
      <Privacy />
      <FAQ />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

/* ---------------------------------------------------------------- Hero */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_1fr] md:py-28">
        <div className="flex flex-col justify-center">
          <div className="postmark w-fit">Est. today · U.S. Mail</div>
          <h1 className="mt-6 text-5xl leading-[1.05] md:text-7xl">
            Mail a letter
            <br />
            <span className="italic text-stamp">without a printer.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-ink-soft">
            Upload a PDF or write your letter right here in the browser. We'll print, stamp, and mail it
            for you — color or black-and-white, standard or certified.
          </p>
          <p className="mt-4 max-w-lg text-sm text-muted-foreground">
            PDF or typed letter · U.S. domestic mail · No account required · Private &amp; secure
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/send"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5"
            >
              Upload PDF
              <ArrowRight />
            </Link>
            <Link
              to="/write"
              className="inline-flex items-center gap-2 rounded-full border border-input px-5 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              Write a letter
            </Link>
            <span className="font-mono text-xs uppercase tracking-widest text-stamp">Starting at $4.99</span>
          </div>
          <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
            Printed and mailed through professional mail partners
          </p>
        </div>

        <EnvelopeIllustration />
      </div>
    </section>
  );
}

function EnvelopeIllustration() {
  return (
    <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
      <div className="absolute inset-0 -rotate-3 rounded-2xl bg-paper-deep" aria-hidden />
      <div className="envelope-card relative w-full rotate-1 p-6">
        <div className="flex items-start justify-between">
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            From
            <div className="mt-1 font-sans text-sm normal-case tracking-normal text-foreground">
              MailMyPDF Print Center
              <div className="text-xs text-muted-foreground">Los Angeles, CA 90001</div>
            </div>
          </div>
          <Stamp />
        </div>

        <div className="mt-10 border-l-2 border-dashed border-rule pl-4">
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">To</div>
          <div className="mt-1 font-serif text-2xl leading-tight text-foreground">
            Jane Doe
          </div>
          <div className="font-mono text-sm text-ink-soft">
            500 Market Street, Suite 200<br />
            San Francisco, CA 94105
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-dashed border-rule pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Logo />
            <span>Order #A9F2-7C</span>
          </div>
          <div className="postmark">3 pages · color</div>
        </div>
      </div>
    </div>
  );
}

function Stamp() {
  return (
    <div className="relative flex h-16 w-14 flex-col items-center justify-center rounded-sm border-2 border-dashed border-stamp bg-stamp/10 text-stamp">
      <div className="font-serif text-lg leading-none italic">USA</div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-widest">forever</div>
    </div>
  );
}

/* ----------------------------------------------------------- What's New */
function WhatsNew() {
  const features = [
    {
      tag: "NEW",
      title: "Letter Editor",
      desc: "Type your letter directly in the browser — no PDF needed. We generate a professional document on our end.",
      link: "/write",
      linkLabel: "Write a letter",
    },
    {
      tag: "NEW",
      title: "20+ Templates",
      desc: "Legal, personal, business, and official templates. Pick one, customize it, and mail.",
      link: "/templates",
      linkLabel: "Browse templates",
    },
    {
      tag: "NEW",
      title: "Color Printing",
      desc: `Color or black-and-white — your choice. Just $${colorPerPageUsd()} extra per page for full color.`,
    },
    {
      tag: "NEW",
      title: "Certified & Registered Mail",
      desc: `Add tracking and signature confirmation (${mailClassSurchargeLabel("certified")}) or insured registered mail (${mailClassSurchargeLabel("registered")}).`,
    },
    {
      tag: "NEW",
      title: "Future Self Letters",
      desc: "Write a letter today, schedule delivery up to 5 years out. We'll mail it on the date you choose.",
      link: "/future-self",
      linkLabel: "Write to your future self",
    },
  ];

  return (
    <section className="border-t border-rule/60 bg-paper-deep/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <div className="postmark w-fit">What's new</div>
          <h2 className="mt-4 text-4xl md:text-5xl">Five new ways to mail.</h2>
          <p className="mt-3 text-ink-soft">
            We started as a simple PDF-to-mail service. Now you can write letters online, use templates,
            print in color, send certified mail, and even schedule letters to your future self.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="envelope-card flex flex-col p-6">
              <span className="inline-flex w-fit items-center rounded-sm bg-stamp px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground">
                {f.tag}
              </span>
              <h3 className="mt-3 font-serif text-2xl">{f.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{f.desc}</p>
              {f.link && (
                <Link
                  to={f.link}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-stamp hover:gap-2 transition-all"
                >
                  {f.linkLabel} <ArrowRight />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Dual Path */
function DualPath() {
  return (
    <section className="border-t border-rule/60">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <div className="postmark w-fit">Two ways to send</div>
          <h2 className="mt-4 text-4xl md:text-5xl">Bring your PDF, or write it here.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="envelope-card group p-8 transition-shadow hover:shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-rule bg-paper-deep">
                <PdfIcon />
              </div>
              <h3 className="font-serif text-2xl">Upload a PDF</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Already have your document ready? Drag in a PDF up to 10 pages. We'll check the file, show you
              the price, and mail it.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">
              <li className="flex items-center gap-2"><Dot /> PDF up to 10 pages, 10 MB max</li>
              <li className="flex items-center gap-2"><Dot /> Color or black-and-white</li>
              <li className="flex items-center gap-2"><Dot /> Standard, certified, or registered</li>
            </ul>
            <Link
              to="/send"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform group-hover:-translate-y-0.5"
            >
              Upload PDF <ArrowRight />
            </Link>
          </div>

          <div className="envelope-card group p-8 transition-shadow hover:shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-rule bg-paper-deep">
                <PenIcon />
              </div>
              <h3 className="font-serif text-2xl">Write a letter</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              No PDF? No problem. Type your letter right here in the browser. We'll generate a professional
              document and mail it for you.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">
              <li className="flex items-center gap-2"><Dot /> 20+ professional templates</li>
              <li className="flex items-center gap-2"><Dot /> Legal, personal, business &amp; official</li>
              <li className="flex items-center gap-2"><Dot /> Auto-formatted, print-ready output</li>
            </ul>
            <Link
              to="/write"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform group-hover:-translate-y-0.5"
            >
              Write a letter <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- How It Works */
function HowItWorks() {
  const steps = [
    { n: "01", t: "Upload or write", d: "Drag in a PDF or type your letter in the browser. Pick a template if you need one." },
    { n: "02", t: "Enter addresses", d: "Sender and recipient. U.S. addresses only in this release." },
    { n: "03", t: "Choose options", d: "Color or B&W. Standard, certified, or registered mail. Schedule for later if you want." },
    { n: "04", t: "Pay &amp; mail", d: "Secure Stripe checkout from $4.99. Your letter enters the mail stream same-day." },
  ];
  return (
    <section id="how" className="border-t border-rule/60 bg-paper-deep/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <div className="postmark w-fit">How it works</div>
          <h2 className="mt-4 text-4xl md:text-5xl">Four steps. No printer.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="envelope-card p-6">
              <div className="font-mono text-xs text-stamp">{s.n}</div>
              <div className="mt-3 font-serif text-2xl">{s.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Pricing */
function Pricing() {
  const tiers = [
    { pages: "1–2 pages", price: "$4.99", note: "Short letters, single-page notices.", popular: false },
    { pages: "3–5 pages", price: "$6.99", note: "Most common. Contracts, cover letters.", popular: true },
    { pages: "6–10 pages", price: "$9.99", note: "Longer documents, appendices.", popular: false },
  ];
  const addons = [
    { name: "Color printing", price: colorPerPageLabel(), note: "per page" },
    { name: "Certified Mail", price: mailClassSurchargeLabel("certified"), note: "tracking + signature" },
    { name: "Registered Mail", price: mailClassSurchargeLabel("registered"), note: "insured + tracking" },
  ];
  return (
    <section id="pricing" className="border-t border-rule/60">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="postmark w-fit">Pricing</div>
            <h2 className="mt-4 text-4xl md:text-5xl">Simple, per-letter.</h2>
            <p className="mt-2 text-muted-foreground">Base price by page count. Add color or premium delivery at checkout.</p>
          </div>
          <Link
            to="/send"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Start a letter <ArrowRight />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.pages} className={`envelope-card p-8 ${t.popular ? "ring-1 ring-stamp/50" : ""}`}>
              {t.popular && <div className="postmark mb-3 w-fit">Most common</div>}
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{t.pages}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-serif text-5xl">{t.price}</span>
                <span className="text-sm text-muted-foreground">per letter</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{t.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {addons.map((a) => (
            <div key={a.name} className="flex items-center justify-between rounded-lg border border-rule/70 bg-paper-deep/50 px-5 py-4">
              <div>
                <div className="font-serif text-lg">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.note}</div>
              </div>
              <div className="font-mono text-sm font-medium text-stamp">{a.price}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ----------------------------------------------------------- Pro Plan */
function ProPlan() {
  const monthlyPrice = `$${(PRO_MONTHLY_PRICE_CENTS / 100).toFixed(2)}`;
  const memberRate = `$${(PRO_MEMBER_RATE_CENTS / 100).toFixed(2)}`;
  return (
    <section className="border-t border-rule/60 bg-gradient-to-b from-stamp/5 to-transparent">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-stamp/10 px-4 py-1.5 text-sm font-medium text-stamp">
            MailMyPDF Pro
          </div>
          <h2 className="font-serif text-4xl font-bold tracking-tight">
            {monthlyPrice}<span className="text-xl text-muted-foreground">/month</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            {PRO_FREE_LETTERS_PER_MONTH} free letters every month. Cancel anytime.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="envelope-card p-5 text-center">
            <div className="font-serif text-3xl font-bold text-stamp">{PRO_FREE_LETTERS_PER_MONTH}</div>
            <div className="mt-1 text-sm text-muted-foreground">free letters / month</div>
          </div>
          <div className="envelope-card p-5 text-center">
            <div className="font-serif text-3xl font-bold text-stamp">{memberRate}</div>
            <div className="mt-1 text-sm text-muted-foreground">per letter after that</div>
          </div>
          <div className="envelope-card p-5 text-center">
            <div className="font-serif text-3xl font-bold text-stamp">No</div>
            <div className="mt-1 text-sm text-muted-foreground">commitment — cancel anytime</div>
          </div>
        </div>
        <div className="text-center">
          <Link
            to="/pro"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Get MailMyPDF Pro <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Templates */
function Templates() {
  const cats = [
    { name: "Legal", items: ["Demand Letter", "Cease & Desist", "Complaint Letter"] },
    { name: "Personal", items: ["Love Letter", "Birthday Letter", "Thank You Letter"] },
    { name: "Business", items: ["Resignation Letter", "Invoice Cover", "Client Follow-up"] },
    { name: "Official", items: ["Letter to IRS", "Letter to Court Clerk", "Letter to Landlord"] },
  ];
  return (
    <section className="border-t border-rule/60 bg-paper-deep/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="postmark w-fit">Templates</div>
            <h2 className="mt-4 text-4xl md:text-5xl">20+ templates, ready to mail.</h2>
            <p className="mt-3 text-ink-soft">
              Pick a template, customize it, and we'll print and mail it. Legal, personal, business, and
              official — all included.
            </p>
          </div>
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 rounded-full border border-input px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Browse all templates <ArrowRight />
          </Link>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-4">
          {cats.map((cat) => (
            <div key={cat.name}>
              <div className="font-mono text-xs uppercase tracking-widest text-stamp">{cat.name}</div>
              <div className="mt-4 space-y-3">
                {cat.items.map((item) => (
                  <Link
                    key={item}
                    to="/templates"
                    className="block rounded-lg border border-rule/60 bg-card p-4 text-sm transition-colors hover:border-stamp/50"
                  >
                    <div className="font-serif text-lg">{item}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Privacy */
function Privacy() {
  const cards = [
    { t: "Private uploads", d: "Your file is used only to fulfill your order." },
    { t: "Secure payment via Stripe", d: "Card details are handled by Stripe, never stored by us." },
    { t: "Order tracking by email", d: "A private link lets you follow your letter's status." },
  ];
  return (
    <section className="border-t border-rule/60">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <div className="postmark w-fit">Privacy</div>
          <h2 className="mt-4 text-4xl md:text-5xl">Your document stays private.</h2>
          <p className="mt-4 text-ink-soft">
            Uploaded PDFs and typed letters are used only to process, print, and mail your order. We do not
            use customer documents for AI training, resale, or marketing.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <div key={c.t} className="envelope-card p-6">
              <div className="font-serif text-xl">{c.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- FAQ */
function FAQ() {
  const qs = [
    { q: "Do I need a PDF, or can I write my letter online?", a: "Either one. Upload an existing PDF, or use our letter editor to type directly in the browser. We'll generate a print-ready document from your text." },
    { q: "What file types do you accept?", a: "PDF for uploads (up to 10 MB, 10 pages max). If you're writing a letter, just type — no file needed." },
    { q: "Can I print in color?", a: `Yes. Color printing is available for $${colorPerPageUsd()} extra per page. Choose color or black-and-white before checkout.` },
    { q: "Is certified mail available?", a: `Yes. You can add Certified Mail (tracking + signature) for $${mailClassSurchargeUsd("certified")}, or Registered Mail (insured + tracking) for $${mailClassSurchargeUsd("registered")}.` },
    { q: "What are Future Self letters?", a: "Write a letter today and schedule it to be mailed on any future date — up to 5 years out. We'll print and mail it on the day you choose." },
    { q: "Do I need an account?", a: "No. You can upload, pay, and send as a guest. Your order status link will be sent by email." },
    { q: "Can I send international mail?", a: "Not yet. MailMyPDF currently supports U.S. domestic mail only." },
    { q: "Can I cancel an order?", a: "You may be able to cancel before the order is submitted to our mail partner. Once it has been submitted for printing and mailing, cancellation may not be possible." },
    { q: "How long does mailing take?", a: "Standard mail typically takes 3–7 business days. Certified mail includes tracking. The order page will show the latest available status." },
    { q: "What if I enter the wrong address?", a: "Users are responsible for reviewing the document and address before payment. MailMyPDF prints and mails using the information submitted." },
  ];
  return (
    <section id="faq" className="border-t border-rule/60">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="postmark mx-auto w-fit">FAQ</div>
        <h2 className="mt-4 text-center text-4xl md:text-5xl">Questions people ask</h2>
        <div className="mt-10 divide-y divide-rule/70 border-y border-rule/70">
          {qs.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between list-none">
                <span className="font-serif text-xl">{item.q}</span>
                <span className="text-stamp transition-transform group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Final CTA */
function FinalCTA() {
  return (
    <section className="border-t border-rule/60">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="postmark mx-auto w-fit">Ready to mail</div>
        <h2 className="mt-4 font-serif text-5xl md:text-6xl">
          Upload. Address. <span className="italic text-stamp">Mailed.</span>
        </h2>
        <p className="mt-4 text-ink-soft">Or write it right here. No printer, no stamps, no trip to the post office.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/send"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-medium text-primary-foreground shadow-stamp hover:-translate-y-0.5 transition-transform"
          >
            Upload PDF <ArrowRight />
          </Link>
          <Link
            to="/write"
            className="inline-flex items-center gap-2 rounded-full border border-input px-6 py-3.5 text-base font-medium hover:bg-muted"
          >
            Write a letter
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Icons */
function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Dot() {
  return <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-stamp" />;
}

function PdfIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 3h7l5 5v13H7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="12" y="17" textAnchor="middle" fontSize="5" fill="currentColor" fontFamily="monospace" fontWeight="600">PDF</text>
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 3l7 7-11 11H3v-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 3l3-3 4 4-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
