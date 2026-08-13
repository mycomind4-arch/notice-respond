import { Link } from "@tanstack/react-router";
import { FileCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-warm-border bg-white">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700">
                <FileCheck size={16} className="text-emerald-400" />
              </div>
              <span className="text-base font-bold text-slate-700" style={{ fontFamily: "var(--font-serif)" }}>Notice Respond</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">Prepare and send responses to government notices with confidence.</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><a href="/#how" className="hover:text-emerald-600">How it works</a></li>
              <li><a href="/#workflows" className="hover:text-emerald-600">What you can respond to</a></li>
              <li><Link to="/pricing" className="hover:text-emerald-600">Pricing</Link></li>
              <li><Link to="/dashboard" className="hover:text-emerald-600">My Mailings</Link></li>
              <li><Link to="/faq" className="hover:text-emerald-600">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700">Resources</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><Link to="/resources" className="hover:text-emerald-600">Guides</Link></li>
              <li><Link to="/about" className="hover:text-emerald-600">About</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-600">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-600">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-600">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700">Important</h3>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              Notice Respond is not a law firm, CPA firm, or government agency and does not provide legal or tax advice.
              You remain in control of the facts and final document.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-warm-border pt-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <span>© 2026 Notice Respond. Powered by MailMyPDF.</span>
          <span>Information is educational and product-related, not legal advice.</span>
        </div>
      </div>
    </footer>
  );
}
