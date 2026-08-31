from permit_signal.extractor import extract_opportunity
from permit_signal.models import CrawledDocument, SignalType, SourceSpec


def test_extracts_bid_with_evidence() -> None:
    source = SourceSpec(
        name="Test City",
        jurisdiction="Test City, CA",
        source_type="bids",
        urls=["https://example.com/procurement"],
        keywords=["invitation to bid", "contractor"],
    )
    document = CrawledDocument(
        url="https://example.com/bids/road.pdf",
        title="Road rehabilitation",
        text="Notice inviting bids from qualified contractors for road rehabilitation.",
        content_type="application/pdf",
    )

    result = extract_opportunity(document, source)

    assert result is not None
    assert result.signal_type == SignalType.BID
    assert result.evidence_url == document.url
    assert result.confidence >= 0.7


def test_ignores_unmatched_page() -> None:
    source = SourceSpec(
        name="Test City",
        jurisdiction="Test City, CA",
        urls=["https://example.com"],
        keywords=["invitation to bid"],
    )
    document = CrawledDocument(
        url="https://example.com/library",
        title="Library hours",
        text="The library is open Monday through Friday.",
        content_type="text/html",
    )

    assert extract_opportunity(document, source) is None
