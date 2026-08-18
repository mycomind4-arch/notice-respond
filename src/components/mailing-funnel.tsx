/**
 * Reusable Mailing Funnel Component
 *
 * This component provides the response → MailMyPDF completion funnel
 * that any workflow can inherit. It:
 * - Makes "Mail this response" the dominant next action after validation
 * - Pre-populates the mailing flow with the completed response, recipient, and metadata
 * - Shows the mailing method, expected proof/tracking, and final review before payment
 * - Surfaces the real MailMyPDF adapter state (never simulates success)
 * - Offers downloading as a secondary option
 *
 * Usage:
 *   <MailingFunnel
 *     draft={state.draft}
 *     workflowId={definition.id}
 *     workflowTitle={definition.title}
 *     recipient={state.mailing?.recipient}
 *     extractionRef={cp14Extraction?.noticeNumber}
 *     mailOptions={definition.ux?.mailOptions ?? MAIL_OPTIONS}
 *     disclaimer={definition.ux?.disclaimerText}
 *   />
 */

import { useState, useCallback, useRef } from "react";
import { MAIL_OPTIONS, type MailOption } from "@/components/workflow-shell";

export interface MailingRecipient {
  name: string;
  org: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

export interface MailingFunnelProps {
  draft: string;
  workflowId: string;
  workflowTitle: string;
  recipient?: MailingRecipient | null;
  extractionRef?: string | null;
  taxYear?: string | null;
  mailOptions?: MailOption[];
  disclaimer?: string;
  // Callback when mailing is submitted (parent can update workflow state)
  onMailingStateChange?: (state: MailingFunnelState) => void;
}

export interface MailingFunnelState {
  phase: "review" | "recipient" | "method" | "checkout" | "submitting" | "submitted" | "error";
  recipient: MailingRecipient;
  method: string;
  providerOrderId: string | null;
  trackingNumber: string | null;
  error: string | null;
}

const DEFAULT_RECIPIENT: MailingRecipient = {
  name: "",
  org: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
};

export function MailingFunnel({
  draft,
  workflowId,
  workflowTitle,
  recipient,
  extractionRef,
  taxYear,
  mailOptions = MAIL_OPTIONS,
  disclaimer,
  onMailingStateChange,
}: MailingFunnelProps) {
  const [phase, setPhase] = useState<MailingFunnelState["phase"]>("review");
  const [mailRecipient, setMailRecipient] = useState<MailingRecipient>(
    recipient ?? DEFAULT_RECIPIENT
  );
  const [method, setMethod] = useState("certified");
  const [providerOrderId, setProviderOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const notifyParent = useCallback(
    (updates: Partial<MailingFunnelState>) => {
      onMailingStateChange?.({
        phase,
        recipient: mailRecipient,
        method,
        providerOrderId,
        trackingNumber,
        error,
        ...updates,
      });
    },
    [phase, mailRecipient, method, providerOrderId, trackingNumber, error, onMailingStateChange]
  );

  // ── Download the response as a file (secondary option) ──
  const handleDownload = useCallback(() => {
    const blob = new Blob([draft], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
    const a = document.createElement("a");
    a.href = url;
    a.download = `response-${workflowId}-${extractionRef ?? "draft"}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [draft, workflowId, extractionRef]);

  // ── Submit mailing through MailMyPDF adapter ──
  const handleSubmitMailing = useCallback(async () => {
    setPhase("submitting");
    setError(null);
    notifyParent({ phase: "submitting" });

    try {
      // Upload the draft as a document to MailMyPDF
      const blob = new Blob([draft], { type: "text/plain" });
      const file = new File([blob], `response-${extractionRef ?? workflowId}.txt`, {
        type: "text/plain",
      });

      // Call the server-side mailing endpoint
      // This uses the existing MailMyPDF platform integration boundary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("workflowId", workflowId);
      formData.append("recipientName", mailRecipient.name);
      formData.append("recipientOrg", mailRecipient.org);
      formData.append("recipientAddress1", mailRecipient.address1);
      formData.append("recipientAddress2", mailRecipient.address2);
      formData.append("recipientCity", mailRecipient.city);
      formData.append("recipientState", mailRecipient.state);
      formData.append("recipientZip", mailRecipient.zip);
      formData.append("mailType", method);
      formData.append("matterReference", extractionRef ?? workflowId);
      formData.append("matterType", "notice-respond");

      const response = await fetch("/api/mail/response", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error ?? `Mailing submission failed (${response.status})`
        );
      }

      const result = await response.json();
      setProviderOrderId(result.providerOrderId ?? result.id ?? null);
      setTrackingNumber(result.trackingNumber ?? null);
      setPhase("submitted");
      notifyParent({
        phase: "submitted",
        providerOrderId: result.providerOrderId ?? result.id ?? null,
        trackingNumber: result.trackingNumber ?? null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown mailing error";
      setError(msg);
      setPhase("error");
      notifyParent({ phase: "error", error: msg });
    }
  }, [draft, extractionRef, workflowId, mailRecipient, method, notifyParent]);

  const selectedOption = mailOptions.find((m) => m.id === method) ?? mailOptions[1];

  // ── Phase: Review (dominant CTA: Mail this response) ──
  if (phase === "review") {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border-2 border-stamp/30 bg-stamp/5 p-6">
          <h3 className="font-serif text-2xl text-foreground">Your response is ready to mail</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your validated response draft is complete. Mail it through our integrated mailing service
            with tracking and proof of delivery — or download it to mail yourself.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setPhase("recipient")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Mail this response
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-input px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download instead
            </button>
          </div>
        </div>

        {/* Draft preview */}
        <div className="rounded-lg border border-rule/60 p-4">
          <div className="font-mono text-xs uppercase tracking-widest text-stamp">Response Draft Preview</div>
          <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">
            {draft.slice(0, 800)}
            {draft.length > 800 ? "\n…(truncated — full draft will be mailed)" : ""}
          </pre>
        </div>

        {disclaimer && (
          <div className="rounded-md border border-rule/70 bg-paper-deep/40 p-4 text-xs text-muted-foreground">
            {disclaimer}
          </div>
        )}
      </div>
    );
  }

  // ── Phase: Recipient ──
  if (phase === "recipient") {
    return (
      <div className="space-y-6">
        <div className="postmark w-fit">Recipient</div>
        <h2 className="mt-4 font-serif text-3xl">Where should we send it?</h2>
        <p className="mt-3 text-muted-foreground">
          Enter the mailing address from your notice. This is where your response will be sent.
        </p>
        {extractionRef && (
          <div className="rounded-md border border-rule/70 bg-paper-deep/40 p-3 text-sm text-muted-foreground">
            <strong>Notice reference:</strong> {extractionRef}
            {taxYear && <span> · <strong>Tax year:</strong> {taxYear}</span>}
          </div>
        )}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="input-label">Recipient name</label>
              <input
                className="input-field mt-1"
                value={mailRecipient.name}
                onChange={(e) => setMailRecipient({ ...mailRecipient, name: e.target.value })}
                placeholder="IRS — Department of the Treasury"
              />
            </div>
            <div>
              <label className="input-label">Organization</label>
              <input
                className="input-field mt-1"
                value={mailRecipient.org}
                onChange={(e) => setMailRecipient({ ...mailRecipient, org: e.target.value })}
                placeholder="IRS"
              />
            </div>
          </div>
          <div>
            <label className="input-label">Address line 1</label>
            <input
              className="input-field mt-1"
              value={mailRecipient.address1}
              onChange={(e) => setMailRecipient({ ...mailRecipient, address1: e.target.value })}
              placeholder="P.O. Box 912"
            />
          </div>
          <div>
            <label className="input-label">Address line 2 (optional)</label>
            <input
              className="input-field mt-1"
              value={mailRecipient.address2}
              onChange={(e) => setMailRecipient({ ...mailRecipient, address2: e.target.value })}
              placeholder="Suite / Attn"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="input-label">City</label>
              <input
                className="input-field mt-1"
                value={mailRecipient.city}
                onChange={(e) => setMailRecipient({ ...mailRecipient, city: e.target.value })}
                placeholder="Cincinnati"
              />
            </div>
            <div>
              <label className="input-label">State</label>
              <input
                className="input-field mt-1"
                value={mailRecipient.state}
                onChange={(e) => setMailRecipient({ ...mailRecipient, state: e.target.value })}
                placeholder="OH"
              />
            </div>
            <div>
              <label className="input-label">ZIP</label>
              <input
                className="input-field mt-1"
                value={mailRecipient.zip}
                onChange={(e) => setMailRecipient({ ...mailRecipient, zip: e.target.value })}
                placeholder="45201"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => setPhase("review")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back
          </button>
          <button
            onClick={() => setPhase("method")}
            disabled={!mailRecipient.name || !mailRecipient.address1 || !mailRecipient.city || !mailRecipient.state || !mailRecipient.zip}
            className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-stamp disabled:opacity-30"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: Method ──
  if (phase === "method") {
    return (
      <div className="space-y-6">
        <div className="postmark w-fit">Mail type</div>
        <h2 className="mt-4 font-serif text-3xl">Choose your mail type</h2>
        <p className="mt-3 text-muted-foreground">
          For IRS responses, Certified mail is recommended for proof of timely submission.
        </p>
        <div className="space-y-3">
          {mailOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setMethod(opt.id)}
              className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                method === opt.id
                  ? "border-stamp bg-stamp/5"
                  : "border-rule/60 hover:border-stamp/40"
              }`}
            >
              <div>
                <span className="font-medium text-foreground">{opt.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{opt.desc}</span>
              </div>
              <span className="font-serif text-lg">{opt.price}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => setPhase("recipient")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back
          </button>
          <button
            onClick={() => setPhase("checkout")}
            className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-stamp"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: Checkout (final review before payment) ──
  if (phase === "checkout") {
    return (
      <div className="space-y-6">
        <div className="postmark w-fit">Checkout</div>
        <h2 className="mt-4 font-serif text-3xl">Review and pay</h2>
        <p className="mt-3 text-muted-foreground">
          Review the details below. Your response will be mailed through the MailMyPDF integration
          with tracking and proof of delivery.
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-rule/60 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Mail type</span>
            <span className="font-medium text-foreground">{selectedOption?.label}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-rule/60 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Expected delivery</span>
            <span className="font-medium text-foreground">{selectedOption?.desc}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-rule/60 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Recipient</span>
            <span className="font-medium text-foreground">{mailRecipient.name || "—"}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-rule/60 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Address</span>
            <span className="font-medium text-foreground">{mailRecipient.address1 || "—"}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-rule/60 px-4 py-3 text-sm">
            <span className="text-muted-foreground">City, State ZIP</span>
            <span className="font-medium text-foreground">
              {mailRecipient.city ? `${mailRecipient.city}, ${mailRecipient.state} ${mailRecipient.zip}` : "—"}
            </span>
          </div>
          {extractionRef && (
            <div className="flex items-center justify-between rounded-lg border border-rule/60 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Notice reference</span>
              <span className="font-medium text-foreground">{extractionRef}</span>
            </div>
          )}
          {taxYear && (
            <div className="flex items-center justify-between rounded-lg border border-rule/60 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Tax year</span>
              <span className="font-medium text-foreground">{taxYear}</span>
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg border-2 border-stamp/40 bg-stamp/5 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-serif text-lg">{selectedOption?.price}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          By proceeding, you confirm that you have reviewed the response draft and all extracted information.
          Your mailing will be prepared through the MailMyPDF integration.
          Proof of mailing and tracking will be available once the order is processed.
        </p>
        {disclaimer && (
          <div className="rounded-md border border-rule/70 bg-paper-deep/40 p-3 text-xs text-muted-foreground">
            {disclaimer}
          </div>
        )}
        <div className="flex justify-between">
          <button
            onClick={() => setPhase("method")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back
          </button>
          <button
            onClick={handleSubmitMailing}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5"
          >
            Pay and send →
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: Submitting ──
  if (phase === "submitting") {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-stamp border-t-transparent" />
        </div>
        <h2 className="font-serif text-2xl">Submitting your mailing…</h2>
        <p className="text-sm text-muted-foreground">
          Your response is being uploaded and submitted through the MailMyPDF integration.
          This may take a few moments.
        </p>
      </div>
    );
  }

  // ── Phase: Submitted ──
  if (phase === "submitted") {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stamp/10">
          <svg className="h-8 w-8 text-stamp" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-serif text-3xl">Your response has been mailed</h2>
        <p className="text-sm text-muted-foreground">
          Your {workflowTitle} response has been submitted through MailMyPDF and is being processed.
        </p>
        {providerOrderId && (
          <div className="inline-flex items-center gap-2 rounded-lg border border-rule/60 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-mono font-medium text-foreground">{providerOrderId}</span>
          </div>
        )}
        <div className="inline-flex items-center gap-2 rounded-lg border border-rule/60 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Tracking number:</span>
          <span className="font-mono font-medium text-foreground">{trackingNumber ?? "— Pending —"}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Tracking information will update as your mailing progresses through the MailMyPDF system.
        </p>
      </div>
    );
  }

  // ── Phase: Error ──
  if (phase === "error") {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6">
          <h2 className="font-serif text-2xl text-destructive">Mailing submission failed</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Your response draft is still saved. You can retry the mailing or download the response to mail yourself.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => setPhase("checkout")}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp"
          >
            Retry mailing
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center rounded-full border border-input px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Download instead
          </button>
        </div>
      </div>
    );
  }

  return null;
}
