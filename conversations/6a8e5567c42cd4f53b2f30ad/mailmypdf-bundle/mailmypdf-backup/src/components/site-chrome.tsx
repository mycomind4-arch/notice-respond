import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="border-b border-rule/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5 group">
          <Logo />
          <span className="font-serif text-xl leading-none">MailMyPDF</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
          <Link to="/send" className="hover:text-foreground transition-colors">Upload PDF</Link>
          <Link to="/write" className="hover:text-foreground transition-colors">Write a letter</Link>
          <Link to="/bulk" className="hover:text-foreground transition-colors">Bulk Mail</Link>
          <Link to="/templates" className="hover:text-foreground transition-colors">Templates</Link>
          <Link to="/future-self" className="hover:text-foreground transition-colors">Future Self</Link>
          <Link to="/orders" className="hover:text-foreground transition-colors">Find your order</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/write"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-rule px-4 py-2 text-sm font-medium transition-colors hover:border-ink"
          >
            Write a letter
          </Link>
          <Link
            to="/send"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Upload PDF
          </Link>
        </div>
      </div>
    </header>
  );
}

const POPULAR_PAGES: { to: string; label: string }[] = [
  { to: "/mail-a-pdf", label: "Mail a PDF" },
  { to: "/send-letter-online", label: "Send a letter online" },
  { to: "/write", label: "Write a letter online" },
  { to: "/templates", label: "Letter templates" },
  { to: "/future-self", label: "Letter to future self" },
  { to: "/send-a-letter-without-a-printer", label: "Send a letter without a printer" },
  { to: "/print-and-mail-pdf-online", label: "Print and mail PDF online" },
  { to: "/send-documents-by-mail-online", label: "Send documents by mail online" },
  { to: "/orders", label: "Find your order" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule/60">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="font-serif text-lg">MailMyPDF</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Upload a PDF or write a letter online. We print, stamp, and drop it in the mail — no printer needed.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Product</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/send" className="hover:text-stamp">Upload & mail a PDF</Link></li>
              <li><Link to="/write" className="hover:text-stamp">Write a letter</Link></li>
              <li><Link to="/templates" className="hover:text-stamp">Templates</Link></li>
              <li><Link to="/future-self" className="hover:text-stamp">Future Self</Link></li>
              <li><Link to="/orders" className="hover:text-stamp">Find your order</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Support</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="/privacy" className="hover:text-stamp">Privacy</a></li>
              <li><a href="/terms" className="hover:text-stamp">Terms</a></li>
              <li><a href="mailto:hello@mailmypdf.com" className="hover:text-stamp">Support</a></li>
              <li><a href="mailto:hello@mailmypdf.com" className="hover:text-stamp">hello@mailmypdf.com</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-rule/60 pt-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Popular pages</div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {POPULAR_PAGES.map((p) => (
              <li key={p.to}>
                <Link to={p.to} className="text-ink-soft hover:text-stamp">{p.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="hairline mt-8 pt-6 text-xs text-muted-foreground">
          MailMyPDF provides document printing and mailing tools. We do not provide legal, tax, financial, or
          professional advice. Users are responsible for reviewing their documents, addresses, deadlines, and
          mailing requirements before submitting an order.
        </div>
      </div>
    </footer>
  );
}

export function Logo() {
  return (
    <span aria-hidden className="relative inline-flex h-8 w-10 items-center justify-center rounded-sm border border-ink bg-paper-deep">
      <span className="absolute inset-x-1 top-1 h-[7px] border-b border-ink" />
      <span className="absolute right-1 top-1 h-2 w-2 rounded-[1px] bg-stamp" />
    </span>
  );
}
