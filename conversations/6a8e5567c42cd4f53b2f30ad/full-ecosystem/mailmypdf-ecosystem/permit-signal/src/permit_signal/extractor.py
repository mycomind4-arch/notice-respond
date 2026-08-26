import re

from .models import CrawledDocument, Opportunity, SignalType, SourceSpec


CATEGORY_PATTERNS: dict[SignalType, tuple[str, ...]] = {
    SignalType.BID: (
        "request for proposal",
        "request for qualifications",
        "invitation to bid",
        "notice inviting bids",
        "procurement",
        "bid opening",
    ),
    SignalType.PERMIT: (
        "building permit",
        "permit application",
        "permit issued",
        "encroachment permit",
        "conditional use permit",
    ),
    SignalType.PLANNING: (
        "planning commission",
        "site plan",
        "design review",
        "environmental review",
        "public hearing",
    ),
    SignalType.ZONING: (
        "rezoning",
        "zoning amendment",
        "variance",
        "land use",
        "general plan amendment",
    ),
    SignalType.DEVELOPMENT: (
        "development agreement",
        "subdivision",
        "multifamily",
        "commercial development",
        "residential units",
        "square feet",
    ),
}


def _classify(text: str) -> tuple[SignalType, list[str]]:
    lowered = text.lower()
    category_hits: dict[SignalType, list[str]] = {
        category: [pattern for pattern in patterns if pattern in lowered]
        for category, patterns in CATEGORY_PATTERNS.items()
    }
    category, hits = max(category_hits.items(), key=lambda item: len(item[1]))
    return (category, hits) if hits else (SignalType.OTHER, [])


def _summary(text: str, keywords: list[str], limit: int = 420) -> str:
    compact = re.sub(r"\s+", " ", text).strip()
    if not compact:
        return "No extractable text was returned."

    lowered = compact.lower()
    positions = [lowered.find(keyword) for keyword in keywords if lowered.find(keyword) >= 0]
    start = max(0, (min(positions) if positions else 0) - 100)
    excerpt = compact[start : start + limit]
    if start:
        excerpt = "…" + excerpt
    if start + limit < len(compact):
        excerpt += "…"
    return excerpt


def extract_opportunity(
    document: CrawledDocument,
    source: SourceSpec,
) -> Opportunity | None:
    text = f"{document.title}\n{document.text}"
    lowered = text.lower()

    requested_hits = [keyword for keyword in source.keywords if keyword in lowered]
    signal_type, category_hits = _classify(text)
    matched = sorted(set(requested_hits + category_hits))

    if not matched:
        return None

    confidence = min(0.98, 0.45 + (0.08 * len(matched)))
    if signal_type != SignalType.OTHER:
        confidence = min(0.98, confidence + 0.10)
    if document.content_type == "application/pdf":
        confidence = min(0.98, confidence + 0.05)

    return Opportunity.build(
        source_name=source.name,
        jurisdiction=source.jurisdiction,
        signal_type=signal_type,
        title=document.title[:240],
        summary=_summary(document.text, matched),
        evidence_url=document.url,
        matched_keywords=matched,
        confidence=round(confidence, 2),
    )
