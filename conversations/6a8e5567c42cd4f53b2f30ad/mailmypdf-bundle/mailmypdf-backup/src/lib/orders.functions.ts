import { createServerFn } from "@tanstack/react-start";
import { canTransition, type OrderStatus } from "@/lib/order-state-machine";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeAddress, sanitizeEmail, sanitizeFileName, sanitizePlainText } from "@/lib/sanitize";
import { logger } from "@/lib/logger";

export function priceIdForPageCount(pages: number): "letter_short" | "letter_medium" | "letter_long" {
  if (pages <= 2) return "letter_short";
  if (pages <= 5) return "letter_medium";
  return "letter_long";
}

// Re-export for backward compatibility with tests
function priceCentsForPageCount(pages: number): number {
  if (pages <= 2) return 499;
  if (pages <= 5) return 699;
  return 999;
}

const addressSchema = z.object({
  name: z.string().min(1).max(120),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional().nullable(),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
});

const mailClassSchema = z.enum(["standard", "certified", "registered"]).default("standard");

// ── PDF Upload: Preview Pricing ──────────────────────────────────────────────

const previewInput = z.object({
  sizeBytes: z.number().int().positive().max(10 * 1024 * 1024),
  dataBase64: z.string().min(1),
});

export const previewPdfPricing = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => previewInput.parse(data))
  .handler(async ({ data }): Promise<{ pageCount: number; priceCents: number } | { error: string }> => {
    try {
      const bytes = decodeBase64(data.dataBase64);
      if (bytes.byteLength !== data.sizeBytes) return { error: "File size mismatch." };

      const { validatePdfForMailing } = await import("@/lib/pdf-validation.server");
      const { pageCount } = await validatePdfForMailing(bytes);
      return { pageCount, priceCents: priceCentsForPageCount(pageCount) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Could not validate this PDF." };
    }
  });

// ── Letter Editor: Preview Pricing ───────────────────────────────────────────

const previewLetterInput = z.object({
  letterText: z.string().min(1).max(20_000),
  color: z.boolean().optional().default(false),
  mailClass: z.enum(["standard", "certified", "registered"]).optional().default("standard"),
});

export const previewLetterPricing = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => previewLetterInput.parse(data))
  .handler(async ({ data }): Promise<{ pageCount: number; priceCents: number } | { error: string }> => {
    try {
      const { estimateLetterPageCount } = await import("@/lib/letter-pdf.server");
      const pageCount = estimateLetterPageCount(data.letterText);
      const { calculateTotalPrice } = await import("@/lib/pricing");
      const priceCents = calculateTotalPrice({ pageCount, color: data.color, mailClass: data.mailClass });
      return { pageCount, priceCents };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Could not estimate pricing." };
    }
  });

// ── Checkout: Create Stripe Session ─────────────────────────────────────────

const checkoutInput = z.object({
  orderId: z.string().uuid(),
  token: z.string().min(8).max(128),
});

type CheckoutResult = { clientSecret: string } | { error: string };

export const createCheckoutForOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => checkoutInput.parse(data))
  .handler(async ({ data }): Promise<CheckoutResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createStripeClient, getMailMyPdfBaseUrl, getStripeErrorMessage } = await import("@/lib/stripe.server");
    const { calculateTotalPrice, priceDescription } = await import("@/lib/pricing");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, lookup_token, status, email, page_count, price_cents, file_name, stripe_session_id, color, mail_class")
      .eq("id", data.orderId)
      .eq("lookup_token", data.token)
      .maybeSingle();
    if (error) return { error: error.message };
    if (!order) return { error: "Order not found." };
    if (!canTransition(order.status as OrderStatus, "checkout_created")) return { error: "This order has already been paid or is no longer available." };

    try {
      const stripe = createStripeClient();

      if (order.stripe_session_id) {
        const existingSession = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
        if (existingSession.client_secret) {
          return { clientSecret: existingSession.client_secret };
        }
      }

      const mailClass = (order.mail_class || "standard") as "standard" | "certified" | "registered";

      // Check for MailMyPDF Pro subscription
      const { getSubscriptionStatus, applyProPricing } = await import("@/lib/subscriptions");
      const subStatus = await getSubscriptionStatus(stripe, supabaseAdmin, order.email);

      const normalTotalCents = calculateTotalPrice({
        pageCount: order.page_count,
        color: order.color ?? false,
        mailClass,
      });

      // Extract base price (without add-ons) for Pro calculation
      const basePriceCents = calculateTotalPrice({
        pageCount: order.page_count,
        color: false,
        mailClass: "standard",
      });

      let totalCents = normalTotalCents;
      let description = priceDescription({
        pageCount: order.page_count,
        color: order.color ?? false,
        mailClass,
      });

      // Apply Pro benefits if user has active subscription
      if (subStatus.isActive) {
        const proResult = applyProPricing({
          pageCount: order.page_count,
          color: order.color ?? false,
          mailClass,
          subStatus,
          basePriceCents,
        });
        totalCents = proResult.totalCents;
        if (proResult.breakdown) {
          description = `${description} · ${proResult.breakdown}`;
        }
      }

      const returnUrl = new URL(`/orders/${order.id}`, `${getMailMyPdfBaseUrl()}/`);
      returnUrl.searchParams.set("token", order.lookup_token);
      returnUrl.searchParams.set("paid", "1");

      const sessionParams = {
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: description,
            },
            unit_amount: totalCents,
          },
          quantity: 1,
        }],
        mode: "payment" as const,
        ui_mode: "embedded_page" as const,
        return_url: returnUrl.toString(),
        customer_email: order.email,
        payment_intent_data: { description: `${description} · ${order.file_name}` },
        metadata: { orderId: order.id },
      };
      const session = await stripe.checkout.sessions.create(sessionParams as any, {
        idempotencyKey: `checkout_${order.id}`,
      });

      const { data: claimed, error: claimError } = await supabaseAdmin
        .from("orders")
        .update({ stripe_session_id: session.id })
        .eq("id", order.id)
        .eq("status", "draft")
        .is("stripe_session_id", null)
        .select("id");

      if (claimError || !claimed || claimed.length !== 1) {
        try {
          await stripe.checkout.sessions.expire(session.id);
        } catch (expirationError) {
          logger.error("Could not expire checkout session after draft ownership was lost", {
            orderId: order.id,
            sessionId: session.id,
            expirationError,
          });
        }
        return { error: "This draft expired before checkout could begin. Please upload the PDF again." };
      }

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

// ── Create Order from PDF Upload ─────────────────────────────────────────────

const createOrderInput = z.object({
  email: z.string().email().max(200),
  sender: addressSchema,
  recipient: addressSchema,
  file: z.object({
    name: z.string().min(1).max(200),
    sizeBytes: z.number().int().positive().max(10 * 1024 * 1024),
    dataBase64: z.string().min(1),
  }),
  color: z.boolean().default(false),
  mailClass: mailClassSchema,
  scheduledDeliveryDate: z.string().datetime().optional(),
});

function randomToken(length = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let output = "";
  for (const byte of bytes) output += chars[byte % chars.length];
  return output;
}

function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const output = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) output[index] = binary.charCodeAt(index);
  return output;
}

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createOrderInput.parse(data))
  .handler(async ({ data }) => {
    // Sanitize and rate limit
    const sanitizedEmail = sanitizeEmail(data.email);
    const rl = rateLimit(sanitizedEmail, "create-order", { maxRequests: 10, windowMs: 3_600_000 });
    if (!rl.allowed) {
      throw new Error("Too many orders. Please try again later.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { validatePdfForMailing } = await import("@/lib/pdf-validation.server");
    const { calculateTotalPrice } = await import("@/lib/pricing");

    // Sanitize user input before storage
    const sender = sanitizeAddress(data.sender);
    const recipient = sanitizeAddress(data.recipient);
    const sanitizedFileName = sanitizeFileName(data.file.name);
    const sanitizedEmailForStorage = sanitizedEmail;

    const pdfBytes = decodeBase64(data.file.dataBase64);
    if (pdfBytes.byteLength !== data.file.sizeBytes) {
      throw new Error("Uploaded file size did not match declared size.");
    }

    const { pageCount } = await validatePdfForMailing(pdfBytes);
    const priceCents = calculateTotalPrice({
      pageCount,
      color: data.color,
      mailClass: data.mailClass,
    });

    const orderId = crypto.randomUUID();
    const token = randomToken(32);
    const storagePath = `${orderId}/${sanitizedFileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("order-pdfs")
      .upload(storagePath, pdfBytes, { contentType: "application/pdf", upsert: false });
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { error: insertError } = await supabaseAdmin.from("orders").insert({
      id: orderId,
      lookup_token: token,
      email: sanitizedEmailForStorage,
      sender_name: sender.name,
      sender_line1: sender.line1,
      sender_line2: sender.line2,
      sender_city: sender.city,
      sender_state: sender.state,
      sender_postal: sender.postalCode,
      recipient_name: recipient.name,
      recipient_line1: recipient.line1,
      recipient_line2: recipient.line2,
      recipient_city: recipient.city,
      recipient_state: recipient.state,
      recipient_postal: data.recipient.postalCode,
      file_name: data.file.name,
      file_size_bytes: data.file.sizeBytes,
      page_count: pageCount,
      pdf_storage_path: storagePath,
      price_cents: priceCents,
      status: "draft",
      color: data.color,
      mail_class: data.mailClass,
      scheduled_delivery_date: data.scheduledDeliveryDate || null,
    });
    if (insertError) {
      await supabaseAdmin.storage.from("order-pdfs").remove([storagePath]);
      throw new Error(`Could not create order: ${insertError.message}`);
    }

    await supabaseAdmin.from("order_events").insert([
      { order_id: orderId, type: "order.created", label: "Order created" },
      {
        order_id: orderId,
        type: "file.uploaded",
        label: `PDF uploaded (${pageCount} page${pageCount === 1 ? "" : "s"})`,
      },
    ]);

    return { orderId, token, pageCount, priceCents };
  });

// ── Create Order from Letter Editor (typed in browser) ──────────────────────

const createLetterOrderInput = z.object({
  email: z.string().email().max(200),
  sender: addressSchema,
  recipient: addressSchema,
  letterText: z.string().min(1).max(20_000),
  templateId: z.string().optional(),
  color: z.boolean().default(false),
  mailClass: mailClassSchema,
  scheduledDeliveryDate: z.string().datetime().optional(),
});

export const createLetterOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createLetterOrderInput.parse(data))
  .handler(async ({ data }) => {
    // Rate limit: 10 letter orders per hour per email
    const rl = rateLimit(data.email.toLowerCase(), "create-letter-order", { maxRequests: 10, windowMs: 3_600_000 });
    if (!rl.allowed) {
      throw new Error("Too many orders. Please try again later.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { generateLetterPdf, estimateLetterPageCount } = await import("@/lib/letter-pdf.server");
    const { calculateTotalPrice } = await import("@/lib/pricing");

    // Generate the PDF from the letter text
    const pdfBytes = await generateLetterPdf({
      letterText: data.letterText,
      senderName: data.sender.name,
      senderLine1: data.sender.line1,
      senderLine2: data.sender.line2 || null,
      senderCity: data.sender.city,
      senderState: data.sender.state,
      senderPostal: data.sender.postalCode,
      recipientName: data.recipient.name,
      recipientLine1: data.recipient.line1,
      recipientLine2: data.recipient.line2 || null,
      recipientCity: data.recipient.city,
      recipientState: data.recipient.state,
      recipientPostal: data.recipient.postalCode,
    });

    // Validate the generated PDF
    const { validatePdfForMailing } = await import("@/lib/pdf-validation.server");
    const { pageCount } = await validatePdfForMailing(pdfBytes);

    const priceCents = calculateTotalPrice({
      pageCount,
      color: data.color,
      mailClass: data.mailClass,
    });

    const orderId = crypto.randomUUID();
    const token = randomToken(32);
    const fileName = data.templateId
      ? `letter-${data.templateId}.pdf`
      : "typed-letter.pdf";
    const storagePath = `${orderId}/${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("order-pdfs")
      .upload(storagePath, pdfBytes, { contentType: "application/pdf", upsert: false });
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { error: insertError } = await supabaseAdmin.from("orders").insert({
      id: orderId,
      lookup_token: token,
      email: data.email,
      sender_name: data.sender.name,
      sender_line1: data.sender.line1,
      sender_line2: data.sender.line2 || null,
      sender_city: data.sender.city,
      sender_state: data.sender.state.toUpperCase(),
      sender_postal: data.sender.postalCode,
      recipient_name: data.recipient.name,
      recipient_line1: data.recipient.line1,
      recipient_line2: data.recipient.line2 || null,
      recipient_city: data.recipient.city,
      recipient_state: data.recipient.state.toUpperCase(),
      recipient_postal: data.recipient.postalCode,
      file_name: fileName,
      file_size_bytes: pdfBytes.byteLength,
      page_count: pageCount,
      pdf_storage_path: storagePath,
      price_cents: priceCents,
      status: "draft",
      color: data.color,
      mail_class: data.mailClass,
      letter_text: data.letterText,
      scheduled_delivery_date: data.scheduledDeliveryDate || null,
    });
    if (insertError) {
      await supabaseAdmin.storage.from("order-pdfs").remove([storagePath]);
      throw new Error(`Could not create order: ${insertError.message}`);
    }

    await supabaseAdmin.from("order_events").insert([
      { order_id: orderId, type: "order.created", label: "Order created" },
      {
        order_id: orderId,
        type: "file.uploaded",
        label: `Letter composed (${pageCount} page${pageCount === 1 ? "" : "s"})`,
      },
    ]);

    return { orderId, token, pageCount, priceCents };
  });

// ── Get Order by Token ───────────────────────────────────────────────────────

const getOrderInput = z.object({
  id: z.string().uuid(),
  token: z.string().min(8).max(128),
});

export const getOrderByToken = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => getOrderInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", data.id)
      .eq("lookup_token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found.");

    const { data: events } = await supabaseAdmin
      .from("order_events")
      .select("type,label,created_at,metadata")
      .eq("order_id", data.id)
      .order("created_at", { ascending: true });

    return { order, events: events ?? [] };
  });

// ── Lookup Order by Email + Order ID ─────────────────────────────────────────

const lookupInput = z.object({
  email: z.string().email().max(200),
  orderId: z.string().uuid(),
});

export const lookupOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => lookupInput.parse(data))
  .handler(async ({ data }): Promise<{ token: string } | { error: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, lookup_token")
      .eq("id", data.orderId)
      .ilike("email", data.email)
      .maybeSingle();
    if (!order) return { error: "We couldn't find an order matching that email and order ID." };
    return { token: order.lookup_token as string };
  });
