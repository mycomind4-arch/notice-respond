/**
 * PDF text extraction using Mozilla PDF.js
 * 
 * Replaces the fragile TextDecoder("latin1") + regex approach
 * that only works on a small subset of PDFs.
 * 
 * This runs client-side (browser) using pdfjs-dist's DOM worker.
 * For scanned/image-only PDFs, rawText will be empty — callers
 * should offer an OCR fallback in that case.
 */

import * as pdfjsLib from "pdfjs-dist";
// Set the worker source to the bundled worker
// @ts-expect-error — vite handles the ?url import
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  pages: string[];
  isImageOnly: boolean;
}

export async function extractPdfText(file: File): Promise<PdfExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    // Don't attempt to run external links or scripts
    disableAutoFetch: false,
    disableStream: false,
  });

  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;
  const pages: string[] = [];
  let totalText = "";

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Build text from text items, preserving reading order
    const pageText = textContent.items
      .map((item: any) => {
        if ("str" in item) {
          return item.str;
        }
        return "";
      })
      .join(" ")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      .trim();

    pages.push(pageText);
    totalText += (totalText ? "\n\n" : "") + pageText;
  }

  // Check if the PDF is image-only (no extractable text)
  const isImageOnly = totalText.trim().length < 20;

  return {
    text: totalText,
    pageCount,
    pages,
    isImageOnly,
  };
}

/**
 * Extract text from any supported file type.
 * For PDFs, uses PDF.js. For text files, reads directly.
 * For images, returns empty (OCR fallback needed).
 */
export async function extractDocumentText(file: File): Promise<{
  text: string;
  pageCount: number;
  isImageOnly: boolean;
  extractor: "pdfjs" | "text" | "image" | "unknown";
}> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    try {
      const result = await extractPdfText(file);
      return {
        text: result.text,
        pageCount: result.pageCount,
        isImageOnly: result.isImageOnly,
        extractor: "pdfjs",
      };
    } catch (err) {
      console.error("PDF.js extraction failed:", err);
      // Fall back to raw text extraction (better than nothing)
      const buffer = await file.arrayBuffer();
      const decoder = new TextDecoder("utf-8", { fatal: false });
      const raw = decoder.decode(buffer);
      // Last resort: try to find readable text
      const textMatches = raw.match(/[\x20-\x7E]{4,}/g);
      return {
        text: textMatches ? textMatches.join(" ") : "",
        pageCount: 0,
        isImageOnly: true,
        extractor: "pdfjs",
      };
    }
  } else if (file.type.startsWith("image/")) {
    return { text: "", pageCount: 0, isImageOnly: true, extractor: "image" };
  } else if (file.type.startsWith("text/") || file.type === "application/octet-stream") {
    const text = await file.text();
    return { text, pageCount: 1, isImageOnly: false, extractor: "text" };
  }

  return { text: "", pageCount: 0, isImageOnly: false, extractor: "unknown" };
}
