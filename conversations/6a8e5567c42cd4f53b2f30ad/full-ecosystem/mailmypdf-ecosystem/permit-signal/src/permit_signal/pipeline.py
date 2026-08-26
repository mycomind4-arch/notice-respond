from urllib.parse import urlparse

from .config import Settings
from .engines import DocumentEngines
from .extractor import extract_opportunity
from .models import IngestRequest, IngestResponse, Opportunity
from .security import UnsafeTargetError, validate_public_url
from .store import Store


class IngestionPipeline:
    def __init__(self, settings: Settings, store: Store):
        self.settings = settings
        self.store = store
        self.engines = DocumentEngines(settings)

    async def run(self, request: IngestRequest) -> IngestResponse:
        source = request.source
        limit = min(request.max_pages, self.settings.max_pages_per_run)
        queue = [str(url) for url in source.urls]
        seen: set[str] = set()
        documents_processed = 0
        opportunities: list[Opportunity] = []
        errors: list[str] = []
        source_hosts = {urlparse(str(url)).hostname for url in source.urls}

        await self.store.save_source(source)

        while queue and documents_processed < limit:
            url = queue.pop(0)
            if url in seen:
                continue
            seen.add(url)

            try:
                validate_public_url(url)
                document = (
                    await self.engines.fetch_pdf(url)
                    if url.lower().split("?", 1)[0].endswith(".pdf")
                    else await self.engines.crawl(url)
                )
                documents_processed += 1

                opportunity = extract_opportunity(document, source)
                if opportunity:
                    opportunities.append(opportunity)

                for link in document.discovered_links:
                    parsed = urlparse(link)
                    is_same_source = parsed.hostname in source_hosts
                    is_relevant_document = parsed.path.lower().endswith(".pdf")
                    if is_same_source and is_relevant_document and link not in seen:
                        queue.append(link)
            except (UnsafeTargetError, Exception) as exc:
                errors.append(f"{url}: {type(exc).__name__}: {exc}")

        unique = {item.id: item for item in opportunities}
        results = list(unique.values())
        await self.store.save_opportunities(results)

        return IngestResponse(
            source=source,
            documents_processed=documents_processed,
            opportunities_found=len(results),
            opportunities=results,
            errors=errors,
        )
