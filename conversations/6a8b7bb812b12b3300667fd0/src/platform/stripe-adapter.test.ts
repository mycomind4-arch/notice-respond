import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  StripeAdapter,
  getStripeAdapter,
  _resetStripeAdapter,
  _setStripeAdapter,
} from "./stripe-adapter";

// ── Stripe adapter: initialization ────────────────────────────────────────

describe("StripeAdapter: initialization", () => {
  it("throws when secret key is empty", () => {
    expect(() => new StripeAdapter({ secretKey: "" })).toThrow(
      /secret key is required/,
    );
  });

  it("throws when secret key is whitespace only", () => {
    expect(() => new StripeAdapter({ secretKey: "   " })).toThrow(
      /secret key is required/,
    );
  });

  it("constructs with a valid key", () => {
    const adapter = new StripeAdapter({ secretKey: "sk_test_123" });
    expect(adapter.provider).toBe("stripe");
  });
});

// ── Stripe adapter: factory ──────────────────────────────────────────────

describe("StripeAdapter: factory", () => {
  beforeEach(() => {
    _resetStripeAdapter();
    delete process.env.STRIPE_SECRET_KEY;
  });

  afterEach(() => {
    _resetStripeAdapter();
    delete process.env.STRIPE_SECRET_KEY;
  });

  it("returns null when STRIPE_SECRET_KEY is not set", () => {
    expect(getStripeAdapter()).toBe(null);
  });

  it("returns an adapter when STRIPE_SECRET_KEY is set", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    _resetStripeAdapter();
    const adapter = getStripeAdapter();
    expect(adapter).not.toBe(null);
    expect(adapter!.provider).toBe("stripe");
  });

  it("caches the adapter (returns same instance)", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    _resetStripeAdapter();
    const a = getStripeAdapter();
    const b = getStripeAdapter();
    expect(a).toBe(b);
  });

  it("test-only injection works", () => {
    const mock = new StripeAdapter({ secretKey: "sk_test_injected" });
    _setStripeAdapter(mock);
    expect(getStripeAdapter()).toBe(mock);
    _setStripeAdapter(null);
  });
});

// ── Stripe adapter: checkout session creation ────────────────────────────

describe("StripeAdapter: createCheckoutSession", () => {
  it("creates a session with server-authoritative amount", async () => {
    const mockSession = {
      id: "cs_test_123",
      url: "https://checkout.stripe.com/c/cs_test_123",
      payment_intent: "pi_test_123",
    };

    const adapter = new StripeAdapter({ secretKey: "sk_test_123" });
    // Mock the Stripe client's create method
    (adapter as unknown as { client: { checkout: { sessions: { create: typeof vi.fn } } } }).client.checkout.sessions.create = vi.fn().mockResolvedValue(mockSession) as unknown as typeof vi.fn;

    const result = await adapter.createCheckoutSession({
      amount: 2499,
      currency: "usd",
      successUrl: "https://example.com/success",
      cancelUrl: "https://example.com/cancel",
      metadata: { matterId: "m1", ownerId: "u1", workflowId: "contractor-dispute" },
      description: "Test checkout",
    });

    expect(result.sessionId).toBe("cs_test_123");
    expect(result.sessionUrl).toBe("https://checkout.stripe.com/c/cs_test_123");
    expect(result.paymentIntentId).toBe("pi_test_123");
  });

  it("passes metadata through to Stripe", async () => {
    let capturedArgs: unknown;
    const mockSession = {
      id: "cs_test_456",
      url: "https://checkout.stripe.com/c/cs_test_456",
      payment_intent: null,
    };

    const adapter = new StripeAdapter({ secretKey: "sk_test_123" });
    (adapter as unknown as { client: { checkout: { sessions: { create: typeof vi.fn } } } }).client.checkout.sessions.create = vi.fn().mockImplementation((args: unknown) => {
      capturedArgs = args;
      return Promise.resolve(mockSession);
    }) as unknown as typeof vi.fn;

    await adapter.createCheckoutSession({
      amount: 1849,
      currency: "usd",
      successUrl: "https://example.com/success",
      cancelUrl: "https://example.com/cancel",
      metadata: { matterId: "matter-abc", ownerId: "user-xyz", workflowId: "property-insurance-claim" },
      description: "Test checkout",
    });

    expect((capturedArgs as { metadata: Record<string, string> }).metadata).toEqual({
      matterId: "matter-abc",
      ownerId: "user-xyz",
      workflowId: "property-insurance-claim",
    });
    expect((capturedArgs as { line_items: Array<{ price_data: { unit_amount: number }> }> }).line_items[0].price_data.unit_amount).toBe(1849);
  });
});

// ── Stripe adapter: webhook signature verification ───────────────────────

describe("StripeAdapter: constructWebhookEvent", () => {
  it("returns the event when signature is valid", () => {
    const mockEvent = { type: "checkout.session.completed", data: { object: {} } };
    const adapter = new StripeAdapter({ secretKey: "sk_test_123" });

    // Mock the webhooks.constructEvent method
    (adapter as unknown as { client: { webhooks: { constructEvent: typeof vi.fn } } }).client.webhooks.constructEvent = vi.fn().mockReturnValue(mockEvent) as unknown as typeof vi.fn;

    const event = adapter.constructWebhookEvent("raw-body", "t=signature", "whsec_test");
    expect(event).toBe(mockEvent);
  });

  it("throws when signature is invalid", () => {
    const adapter = new StripeAdapter({ secretKey: "sk_test_123" });
    (adapter as unknown as { client: { webhooks: { constructEvent: typeof vi.fn } } }).client.webhooks.constructEvent = vi.fn().mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature for payload");
    }) as unknown as typeof vi.fn;

    expect(() =>
      adapter.constructWebhookEvent("raw-body", "t=invalid", "whsec_test"),
    ).toThrow(/No signatures found/);
  });
});

// ── Stripe adapter: payment intent retrieval ────────────────────────────

describe("StripeAdapter: retrievePaymentIntent", () => {
  it("returns payment intent details", async () => {
    const mockIntent = {
      id: "pi_test_123",
      status: "succeeded",
      amount: 2499,
      currency: "usd",
    };

    const adapter = new StripeAdapter({ secretKey: "sk_test_123" });
    (adapter as unknown as { client: { paymentIntents: { retrieve: typeof vi.fn } } }).client.paymentIntents.retrieve = vi.fn().mockResolvedValue(mockIntent) as unknown as typeof vi.fn;

    const result = await adapter.retrievePaymentIntent("pi_test_123");
    expect(result.id).toBe("pi_test_123");
    expect(result.status).toBe("succeeded");
    expect(result.amount).toBe(2499);
    expect(result.currency).toBe("usd");
  });
});
