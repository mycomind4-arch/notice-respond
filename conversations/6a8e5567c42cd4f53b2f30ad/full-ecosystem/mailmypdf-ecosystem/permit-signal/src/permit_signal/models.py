from datetime import datetime, timezone
from enum import StrEnum
from hashlib import sha256

from pydantic import BaseModel, Field, HttpUrl, field_validator


class SourceType(StrEnum):
    PERMITS = "permits"
    BIDS = "bids"
    PLANNING = "planning"
    ZONING = "zoning"
    MIXED = "mixed"


class SourceSpec(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    jurisdiction: str = Field(min_length=2, max_length=160)
    source_type: SourceType = SourceType.MIXED
    urls: list[HttpUrl] = Field(min_length=1, max_length=20)
    keywords: list[str] = Field(
        default_factory=lambda: [
            "permit",
            "development",
            "planning",
            "zoning",
            "request for proposal",
            "invitation to bid",
            "contractor",
        ],
        max_length=50,
    )

    @field_validator("keywords")
    @classmethod
    def normalize_keywords(cls, values: list[str]) -> list[str]:
        cleaned = {value.strip().lower() for value in values if value.strip()}
        return sorted(cleaned)


class IngestRequest(BaseModel):
    source: SourceSpec
    max_pages: int = Field(default=10, ge=1, le=50)


class CrawledDocument(BaseModel):
    url: str
    title: str
    text: str
    content_type: str
    discovered_links: list[str] = Field(default_factory=list)


class SignalType(StrEnum):
    PERMIT = "permit"
    BID = "bid"
    PLANNING = "planning"
    ZONING = "zoning"
    DEVELOPMENT = "development"
    OTHER = "other"


class Opportunity(BaseModel):
    id: str
    source_name: str
    jurisdiction: str
    signal_type: SignalType
    title: str
    summary: str
    evidence_url: str
    matched_keywords: list[str]
    confidence: float = Field(ge=0, le=1)
    discovered_at: datetime

    @classmethod
    def build(
        cls,
        *,
        source_name: str,
        jurisdiction: str,
        signal_type: SignalType,
        title: str,
        summary: str,
        evidence_url: str,
        matched_keywords: list[str],
        confidence: float,
    ) -> "Opportunity":
        identity = sha256(
            f"{source_name}|{jurisdiction}|{evidence_url}|{title}".encode("utf-8")
        ).hexdigest()[:24]
        return cls(
            id=identity,
            source_name=source_name,
            jurisdiction=jurisdiction,
            signal_type=signal_type,
            title=title,
            summary=summary,
            evidence_url=evidence_url,
            matched_keywords=matched_keywords,
            confidence=confidence,
            discovered_at=datetime.now(timezone.utc),
        )


class IngestResponse(BaseModel):
    source: SourceSpec
    documents_processed: int
    opportunities_found: int
    opportunities: list[Opportunity]
    errors: list[str] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str
    environment: str
    engines: dict[str, bool]
