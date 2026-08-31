from pathlib import Path

import aiosqlite

from .models import Opportunity, SourceSpec


class Store:
    def __init__(self, database_path: str):
        self.database_path = database_path

    async def initialize(self) -> None:
        path = Path(self.database_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        async with aiosqlite.connect(path) as database:
            await database.executescript(
                """
                CREATE TABLE IF NOT EXISTS sources (
                    name TEXT PRIMARY KEY,
                    jurisdiction TEXT NOT NULL,
                    source_type TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS opportunities (
                    id TEXT PRIMARY KEY,
                    source_name TEXT NOT NULL,
                    jurisdiction TEXT NOT NULL,
                    signal_type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    evidence_url TEXT NOT NULL,
                    matched_keywords_json TEXT NOT NULL,
                    confidence REAL NOT NULL,
                    discovered_at TEXT NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_opportunities_jurisdiction
                    ON opportunities(jurisdiction);
                CREATE INDEX IF NOT EXISTS idx_opportunities_discovered_at
                    ON opportunities(discovered_at DESC);
                """
            )
            await database.commit()

    async def save_source(self, source: SourceSpec) -> None:
        async with aiosqlite.connect(self.database_path) as database:
            await database.execute(
                """
                INSERT INTO sources(name, jurisdiction, source_type, payload_json)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(name) DO UPDATE SET
                    jurisdiction = excluded.jurisdiction,
                    source_type = excluded.source_type,
                    payload_json = excluded.payload_json,
                    updated_at = CURRENT_TIMESTAMP
                """,
                (
                    source.name,
                    source.jurisdiction,
                    source.source_type.value,
                    source.model_dump_json(),
                ),
            )
            await database.commit()

    async def save_opportunities(self, opportunities: list[Opportunity]) -> None:
        if not opportunities:
            return
        async with aiosqlite.connect(self.database_path) as database:
            await database.executemany(
                """
                INSERT INTO opportunities(
                    id, source_name, jurisdiction, signal_type, title, summary,
                    evidence_url, matched_keywords_json, confidence, discovered_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    summary = excluded.summary,
                    matched_keywords_json = excluded.matched_keywords_json,
                    confidence = excluded.confidence,
                    discovered_at = excluded.discovered_at
                """,
                [
                    (
                        item.id,
                        item.source_name,
                        item.jurisdiction,
                        item.signal_type.value,
                        item.title,
                        item.summary,
                        item.evidence_url,
                        item.model_dump_json(include={"matched_keywords"}),
                        item.confidence,
                        item.discovered_at.isoformat(),
                    )
                    for item in opportunities
                ],
            )
            await database.commit()

    async def list_opportunities(self, limit: int = 100) -> list[dict]:
        async with aiosqlite.connect(self.database_path) as database:
            database.row_factory = aiosqlite.Row
            cursor = await database.execute(
                "SELECT * FROM opportunities ORDER BY discovered_at DESC LIMIT ?",
                (limit,),
            )
            return [dict(row) for row in await cursor.fetchall()]

    async def list_sources(self) -> list[dict]:
        async with aiosqlite.connect(self.database_path) as database:
            database.row_factory = aiosqlite.Row
            cursor = await database.execute(
                "SELECT name, jurisdiction, source_type, updated_at FROM sources "
                "ORDER BY name"
            )
            return [dict(row) for row in await cursor.fetchall()]
