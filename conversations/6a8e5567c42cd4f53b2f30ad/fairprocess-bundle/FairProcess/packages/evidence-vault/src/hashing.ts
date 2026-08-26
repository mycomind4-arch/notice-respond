import { createHash, type Hash } from "node:crypto";

/**
 * SHA-256 of a buffer. Returns lowercase hex.
 */
export function sha256Buffer(data: Buffer | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * SHA-256 of a stream. Returns lowercase hex.
 * The caller passes an async iterable of Buffer chunks.
 */
export async function sha256Stream(
  stream: AsyncIterable<Buffer | Uint8Array>,
): Promise<string> {
  const hash: Hash = createHash("sha256");
  for await (const chunk of stream) {
    hash.update(chunk);
  }
  return hash.digest("hex");
}

/**
 * MIME-type allow-list check. Returns the canonical MIME if the declared
 * type matches the allow-list, otherwise null (caller should quarantine).
 *
 * The declared type comes from the upload request; we trust the allow-list
 * over the client's declared type. In production, content sniffing
 * (magic-byte detection) should run in addition to this check.
 */
export interface MimeTypeCheck {
  readonly allowedMimeTypes: readonly string[];
  readonly maxByteSize: number;
}

export function verifyMime(
  declaredMimeType: string,
  check: MimeTypeCheck,
): boolean {
  return check.allowedMimeTypes.includes(declaredMimeType);
}

export function verifySize(
  byteSize: number,
  check: MimeTypeCheck,
): boolean {
  return byteSize > 0 && byteSize <= check.maxByteSize;
}
