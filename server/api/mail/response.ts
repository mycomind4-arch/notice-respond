/**
 * POST /api/mail/response
 *
 * Server-side mailing endpoint that uses the MailMyPDF platform integration
 * to physically mail a response document.
 *
 * Accepts multipart/form-data produced by the MailingFunnel component:
 *   - file: the response document to mail
 *   - workflowId: the workflow that generated the response
 *   - recipientName, recipientOrg, recipientAddress1, recipientAddress2,
 *     recipientCity, recipientState, recipientZip
 *   - mailType: first_class | certified | registered
 *   - matterReference: notice reference number
 *   - matterType: notice-respond
 *
 * This endpoint calls the real MailMyPDF API:
 * 1. Uploads the document to MailMyPDF
 * 2. Creates a communication (mailing order) with the recipient and mail type
 * 3. Returns the provider order ID, status, and tracking number
 *
 * If MAILMYPDF_API_URL or MAILMYPDF_API_KEY are not set, returns a 503 error
 * explaining that the mailing service is not configured — never simulates success.
 */

import { defineEventHandler, readFormData, createError, getMethod } from "h3";
import {
  uploadDocument,
  createCommunication,
  type MailType,
} from "../../../src/platform/mailmypdf";

// Allowed mail types — validated server-side, never trusts client input
const ALLOWED_MAIL_TYPES: Set<string> = new Set([
  "first_class",
  "certified",
  "certified_return_receipt",
  "registered",
]);

// Max document size: 10 MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

export default defineEventHandler(async (event) => {
  // Only accept POST
  if (getMethod(event) !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method not allowed. Use POST.",
    });
  }

  // Read the form data using the standard Web FormData API
  // (works on Cloudflare Workers, Node, Bun — all Nitro presets)
  const formData = await readFormData(event);
  if (!formData) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "No form data received. Expected multipart/form-data with a file and recipient fields.",
    });
  }

  // ── Extract and validate fields ──
  const file = formData.get("file");
  const workflowId = formData.get("workflowId")?.toString().trim();
  const recipientName = formData.get("recipientName")?.toString().trim();
  const recipientOrg = formData.get("recipientOrg")?.toString().trim() || "";
  const recipientAddress1 = formData.get("recipientAddress1")?.toString().trim();
  const recipientAddress2 = formData.get("recipientAddress2")?.toString().trim() || "";
  const recipientCity = formData.get("recipientCity")?.toString().trim();
  const recipientState = formData.get("recipientState")?.toString().trim();
  const recipientZip = formData.get("recipientZip")?.toString().trim();
  const mailType = formData.get("mailType")?.toString().trim();
  const matterReference = formData.get("matterReference")?.toString().trim() || "";
  const matterType = formData.get("matterType")?.toString().trim() || "notice-respond";

  // Validate file presence
  if (!file || !(file instanceof File)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "No file uploaded. Please include the response document as a file field.",
    });
  }

  // Validate file size
  if (file.size > MAX_DOCUMENT_SIZE) {
    throw createError({
      statusCode: 413,
      statusMessage: `Document too large. Maximum size is ${MAX_DOCUMENT_SIZE / 1024 / 1024} MB.`,
    });
  }

  // Validate required string fields
  const requiredFields: Record<string, string | undefined> = {
    workflowId,
    recipientName,
    recipientAddress1,
    recipientCity,
    recipientState,
    recipientZip,
    mailType,
  };

  for (const [fieldName, value] of Object.entries(requiredFields)) {
    if (!value) {
      throw createError({
        statusCode: 400,
        statusMessage: `Missing required field: ${fieldName}`,
      });
    }
  }

  // Validate mail type against allowlist
  if (!ALLOWED_MAIL_TYPES.has(mailType!)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid mail type: ${mailType}. Allowed: ${[...ALLOWED_MAIL_TYPES].join(", ")}`,
    });
  }

  // Validate state code (2-letter US state abbreviation)
  if (recipientState!.length !== 2) {
    throw createError({
      statusCode: 400,
      statusMessage: "Recipient state must be a 2-letter US state abbreviation.",
    });
  }

  // Validate ZIP code (5 digits, optionally with +4)
  if (!/^\d{5}(-\d{4})?$/.test(recipientZip!)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Recipient ZIP code must be 5 digits (optionally with +4).",
    });
  }

  // ── Check MailMyPDF configuration ──
  const apiUrl = process.env.MAILMYPDF_API_URL;
  const apiKey = process.env.MAILMYPDF_API_KEY;

  if (!apiUrl || !apiKey) {
    // Return 503 — do NOT fake success
    throw createError({
      statusCode: 503,
      statusMessage:
        "MailMyPDF platform is not configured. Set MAILMYPDF_API_URL and MAILMYPDF_API_KEY environment variables to enable mailing.",
    });
  }

  // ── Step 1: Upload the document to MailMyPDF ──
  let documentId: string;
  try {
    const document = await uploadDocument(file);
    documentId = document.id;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error uploading document";
    throw createError({
      statusCode: 502,
      statusMessage: `MailMyPDF document upload failed: ${message}`,
    });
  }

  // ── Step 2: Create the communication (mailing order) ──
  const idempotencyKey = `${workflowId}:${documentId}:${Date.now()}`;

  try {
    const communication = await createCommunication({
      document_id: documentId,
      recipient: {
        name: recipientName!,
        address_line1: recipientAddress1!,
        address_line2: recipientAddress2 || null,
        city: recipientCity!,
        state: recipientState!,
        postal_code: recipientZip!,
        country: "US",
      },
      mail_type: mailType as MailType,
      matter_reference: matterReference || workflowId!,
      matter_type: matterType,
      metadata: {
        workflow_id: workflowId!,
        source: "notice-respond",
      },
      idempotency_key: idempotencyKey,
    });

    return {
      success: true,
      providerOrderId: communication.id,
      trackingNumber: communication.tracking_number ?? null,
      status: communication.status ?? "submitted",
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error creating communication";
    const statusCode =
      err && typeof err === "object" && "status" in err && typeof err.status === "number"
        ? err.status
        : 502;
    throw createError({
      statusCode,
      statusMessage: `MailMyPDF communication creation failed: ${message}`,
    });
  }
});
