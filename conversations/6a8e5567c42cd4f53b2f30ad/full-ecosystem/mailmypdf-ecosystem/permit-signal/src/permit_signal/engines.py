import importlib.util
import io
import tempfile
from pathlib import Path
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup
from pypdf import PdfReader

from .config import Settings
from .models import CrawledDocument
from .security import validate_public_url


def engine_availability() -> dict[str, bool]:
    return {
        "crawl4ai": importlib.util.find_spec("crawl4ai") is not None,
        "docling": importlib.util.find_spec("docling") is not None,
        "paddleocr": importlib.util.find_spec("paddleocr") is not None,
    }


class DocumentEngines:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def crawl(self, url: str) -> CrawledDocument:
        validate_public_url(url)
        if engine_availability()["crawl4ai"]:
            return await self._crawl_with_crawl4ai(url)
        return await self._crawl_with_httpx(url)

    async def _crawl_with_crawl4ai(self, url: str) -> CrawledDocument:
        from crawl4ai import AsyncWebCrawler

        async with AsyncWebCrawler() as crawler:
            result = await crawler.arun(url=url)

        markdown = getattr(result, "markdown", "") or ""
        if hasattr(markdown, "raw_markdown"):
            markdown = markdown.raw_markdown

        links: list[str] = []
        raw_links = getattr(result, "links", {}) or {}
        for group in ("internal", "external"):
            for item in raw_links.get(group, []):
                href = item.get("href") if isinstance(item, dict) else None
                if href:
                    links.append(urljoin(url, href))

        title = getattr(result, "metadata", {}).get("title") or url
        return CrawledDocument(
            url=url,
            title=title,
            text=str(markdown),
            content_type="text/markdown",
            discovered_links=sorted(set(links)),
        )

    async def _crawl_with_httpx(self, url: str) -> CrawledDocument:
        async with httpx.AsyncClient(
            timeout=self.settings.request_timeout_seconds,
            follow_redirects=True,
            headers={"User-Agent": self.settings.user_agent},
        ) as client:
            response = await client.get(url)
            response.raise_for_status()

        final_url = str(response.url)
        validate_public_url(final_url)
        content_type = response.headers.get("content-type", "").lower()
        if "application/pdf" in content_type or final_url.lower().endswith(".pdf"):
            return await self._parse_pdf(final_url, response.content)

        soup = BeautifulSoup(response.text, "html.parser")
        for element in soup(["script", "style", "noscript"]):
            element.decompose()

        title = soup.title.get_text(" ", strip=True) if soup.title else final_url
        links = {
            urljoin(final_url, anchor.get("href"))
            for anchor in soup.find_all("a", href=True)
            if anchor.get("href")
        }
        text = "\n".join(
            line.strip()
            for line in soup.get_text("\n").splitlines()
            if line.strip()
        )
        return CrawledDocument(
            url=final_url,
            title=title,
            text=text,
            content_type=content_type or "text/html",
            discovered_links=sorted(links),
        )

    async def fetch_pdf(self, url: str) -> CrawledDocument:
        validate_public_url(url)
        async with httpx.AsyncClient(
            timeout=self.settings.request_timeout_seconds,
            follow_redirects=True,
            headers={"User-Agent": self.settings.user_agent},
        ) as client:
            response = await client.get(url)
            response.raise_for_status()
        validate_public_url(str(response.url))
        return await self._parse_pdf(str(response.url), response.content)

    async def _parse_pdf(self, url: str, content: bytes) -> CrawledDocument:
        if engine_availability()["docling"]:
            with tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / "document.pdf"
                path.write_bytes(content)
                from docling.document_converter import DocumentConverter

                converted = DocumentConverter().convert(path)
                text = converted.document.export_to_markdown()
        else:
            reader = PdfReader(io.BytesIO(content))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)

        return CrawledDocument(
            url=url,
            title=url.rsplit("/", 1)[-1] or "Public document",
            text=text,
            content_type="application/pdf",
            discovered_links=[],
        )
