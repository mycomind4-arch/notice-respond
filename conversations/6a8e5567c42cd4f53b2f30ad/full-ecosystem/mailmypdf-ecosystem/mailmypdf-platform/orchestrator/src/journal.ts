/**
 * Ecosystem Orchestrator — Engineering Journal
 *
 * Immutable log of all autonomous engineering actions.
 * Every action the orchestrator takes is recorded here for auditability.
 */

import type { JournalEntry, JournalActionType, EngineeringJournal } from "./types.js";

export class Journal {
  private entries: JournalEntry[] = [];
  private cycleId: string;
  private mode: string;
  private startedAt: string;

  constructor(cycleId: string, mode: string) {
    this.cycleId = cycleId;
    this.mode = mode;
    this.startedAt = new Date().toISOString();
  }

  log(
    action: JournalActionType,
    details: string,
    options: { targetRepo?: string | undefined; metadata?: Record<string, unknown> | undefined } = {},
  ): void {
    this.entries.push({
      timestamp: new Date().toISOString(),
      action,
      details,
      targetRepo: options.targetRepo,
      metadata: options.metadata,
    });
  }

  toJournal(): EngineeringJournal {
    return {
      entries: [...this.entries],
      cycleId: this.cycleId,
      mode: this.mode,
      startedAt: this.startedAt,
    };
  }

  formatLog(): string {
    const lines: string[] = [
      "ECOSYSTEM ENGINEERING LOG",
      "",
    ];

    for (const entry of this.entries) {
      const time = new Date(entry.timestamp).toLocaleTimeString("en-US", { hour12: false });
      lines.push(`${time}  ${entry.action}`);
      if (entry.targetRepo) lines.push(`  Target: ${entry.targetRepo}`);
      lines.push(`  ${entry.details}`);
      lines.push("");
    }

    return lines.join("\n");
  }
}

export function generateCycleId(): string {
  const date = new Date().toISOString().slice(0, 10);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${date}-${rand}`;
}
