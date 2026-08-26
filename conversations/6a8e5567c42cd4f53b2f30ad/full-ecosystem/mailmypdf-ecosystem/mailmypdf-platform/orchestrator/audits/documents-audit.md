# DOCUMENTS AUDIT — Cross-Repository Analysis

## Date: 2026-08-15

## 1. Current Platform Implementation (@mailmypdf/documents)

### Implemented
- Document kinds (10 types)
- Lifecycle states (7 states with transition matrix)
- MIME type security (allowed + dangerous lists)
- PDF security scanning (forbidden tokens, encryption, header/footer validation)
- Size/page limits (10MB, 10 pages)
- Document provenance (source type, uploaded by, original filename)
- Page-level metadata (page number, text, dimensions)
- Document record with validation
- Document factory + status update
- Classifier + Extractor interfaces (contracts only, no implementations)

### Missing
- **Document versioning** — no version tracking
- **Document hashing** — sha256 is optional, no computation utility
- **Document relationships** — no relationship between documents
- **Structured source location** — provenance has sourceUrl but no page/offset/excerpt ref
- **Classification lifecycle state** — no "classified" status
- **Extraction operation tracking** — no record of what extraction was performed
- **Duplicate detection** — no hash-based dedup
- **Document text model** — extractedText is a flat string, no structured text/page model
- **Content poisoning protection** — no sanitization of extracted text
- **Path traversal protection** — no filename sanitization
- **SSRF protection** — no URL validation in sourceUrl

## 2. Vertical Document Implementations

### mailmypdf (core production app)
- `Document` interface: id, fileName, sizeBytes, contentType, pageCount, sha256, storagePath, source, templateId
- `DocumentSource` = "upload" | "generated" | "template"
- `DocumentUpload` component: client-side validation (10MB, PDF/PNG/JPEG/WebP/GIF/TIFF)
- Provider interfaces for mail delivery (abstracted, vendor-agnostic)
- Proof-of-service types

### appeal-mail
- **Document extraction engine**: pattern-matching heuristics for dates, deadlines, reference numbers, agencies, decision types, appeal instructions, reasons, timeline building
- **Decision model**: facts, reasons, deadline, timeline events, issues, cited rules, extraction confidence
- **Evidence model**: typed evidence (document, excerpt, testimonial, photographic, record, correspondence) with links to appeal grounds (supports/contradicts/contextual)
- **Timeline model**: canonical event with integrity status (documented, user_reported, inferred, conflicting, unknown), category, source refs, gap detection, conflict detection
- **X-Ray findings**: cross-document analysis (date_conflict, unaddressed_evidence, unsupported_conclusion, contradiction, procedural_issue, factual_discrepancy, missing_reference, strength)
- **SourceRef**: pointer to specific spot in document (documentId, documentName, page, excerpt, offset)
- **DeadlineCalculation**: deadline computation with source tracking, conflicting deadlines, reliability
- **TimelineConflict**: when two sources disagree, with suggested grounds
- **TimelineGap**: periods with no documented events, with potentially useful records

### immigration-mail
- **DocumentAnalysis**: structured analysis (document_type, agency, receipt_number, extracted_dates, requested_actions, referenced_forms, mailing_address, warnings, plain_english_explanation)
- **Text extraction**: client-side pdfjs-dist for PDFs, base64 for images
- **Document storage**: Supabase Storage with upload/signed URL/delete
- **Server-side analysis**: LLM-powered (OpenAI gpt-4o) with structured output

### notice-respond
- MailMyPDF API provider — **near-identical copy** of appeal-mail's provider
- Same mapMailType, mapStatus, createLetter, getStatus pattern

### dispute-mail
- MailMyPDF API client with document upload, communication creation
- `MailMyPDFDocument` interface (id, filename, mime_type, sha256, size_bytes, source)
- **Near-identical** provider to appeal-mail and notice-respond

### mailmypdf-smallbusiness
- `Document` interface — **near-identical** to mailmypdf's Document
- Same Address, Recipient, Template patterns
- Workflow and trigger types for automation

## 3. Duplication Map

### Document Model (HIGH duplication)
| Feature | mailmypdf | smallbusiness | dispute-mail | appeal-mail | immigration |
|---------|-----------|-------------|-------------|-------------|-------------|
| Document interface | ✓ | ✓ (copy) | ✓ (variant) | — | ✓ (variant) |
| Source enum | ✓ | ✓ (copy) | — | — | — |
| File validation | ✓ | — | — | — | ✓ |
| SHA-256 hash | ✓ | ✓ | ✓ | ✓ | — |

### MailMyPDF API Client (EXTREME duplication)
| File | appeal-mail | notice-respond | dispute-mail | immigration |
|------|-------------|---------------|-------------|-------------|
| mailmypdf-provider.ts | ✓ | ✓ (copy) | ✓ (copy) | ✓ (copy) |
| mapMailType | ✓ | ✓ (copy) | ✓ (copy) | — |
| mapStatus | ✓ | ✓ (copy) | ✓ (copy) | — |
| createLetter | ✓ | ✓ (copy) | ✓ (copy) | — |

### Intelligence Model (MEDIUM duplication)
| Concept | appeal-mail | immigration |
|---------|-------------|-------------|
| Fact extraction | DecisionFact | ExtractedDate |
| Date patterns | ✓ (in extraction + timeline) | — (server-side) |
| Source reference | SourceRef | — |
| Deadline computation | DeadlineCalculation | — |
| Timeline events | TimelineEvent | — |
| Findings | XRayFinding | — |
| Conflicts | TimelineConflict | — |

## 4. What Belongs in Platform vs Vertical

### PLATFORM (documents package)
- Document record (id, name, kind, mimeType, size, hash)
- Document versioning
- Document relationships
- Document lifecycle (uploaded → validating → processing → extracted → classified → analyzed → ready → failed)
- Security validation (MIME, PDF tokens, size, filename)
- Provenance (source tracking)
- Page metadata
- Extraction contract (interface)
- Classification contract (interface)
- Duplicate detection (hash-based)
- Source location reference (page, offset, excerpt)

### PLATFORM (intelligence package)
- SourceRef — canonical pointer to a spot in a document
- Fact — a single extracted fact with confidence and source
- Evidence — typed evidence with links to claims
- Finding — cross-document analysis result
- TimelineEvent — chronological event with integrity status
- Conflict — contradiction between sources
- Deadline — computed deadline with source tracking
- Relationship — typed link between any intelligence objects

### VERTICAL-SPECIFIC (stays in vertical repos)
- Appeal-specific: AppealGround, GroundType, AppealMap
- Immigration-specific: DocumentType (USCIS/NVC/EOIR), Agency enum, referenced_forms
- Dispute-specific: dispute types, consumer protection statutes
- Notice-specific: notice response procedures
- Small Business: CRM contacts, templates, workflow triggers

## 5. Architectural Decision

**Evidence Graph is NOT a standalone capability.** It is the relationship layer connecting Documents, Facts, Evidence, Findings, Timeline Events, Deadlines, and Proof.

The intelligence package should be ONE unified package with a single relationship model, not six separate packages.

The chain is:
```
DOCUMENT → SOURCE → FACT → EVIDENCE → RELATIONSHIP → FINDING → TIMELINE → DEADLINE → ACTION
```
