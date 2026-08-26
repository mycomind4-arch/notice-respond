#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  generateIntegrityReport,
  parseAuditCase,
  parsePolicyBundle,
  parseRecorderCsv,
  renderIntegrityReportMarkdown,
} from "./index.js";

interface CliOptions {
  casePath: string;
  recorderPath: string;
  policyPath: string;
  outDir: string;
}

function usage(): string {
  return [
    "Usage:",
    "  fairprocess-audit --case CASE.json --recorder RECORDER.csv --policy POLICY.json --out-dir DIRECTORY",
  ].join("\n");
}

function parseArguments(argumentsList: string[]): CliOptions {
  const normalizedArguments = argumentsList[0] === "--" ? argumentsList.slice(1) : argumentsList;
  const values = new Map<string, string>();
  for (let index = 0; index < normalizedArguments.length; index += 2) {
    const flag = normalizedArguments[index];
    const value = normalizedArguments[index + 1];
    if (!flag?.startsWith("--") || !value || value.startsWith("--")) {
      throw new Error(usage());
    }
    values.set(flag, value);
  }

  const required = ["--case", "--recorder", "--policy", "--out-dir"] as const;
  for (const flag of required) {
    if (!values.has(flag)) throw new Error(`Missing ${flag}\n\n${usage()}`);
  }
  return {
    casePath: resolve(values.get("--case")!),
    recorderPath: resolve(values.get("--recorder")!),
    policyPath: resolve(values.get("--policy")!),
    outDir: resolve(values.get("--out-dir")!),
  };
}

async function main(): Promise<void> {
  const options = parseArguments(process.argv.slice(2));
  const [caseText, recorderText, policyText] = await Promise.all([
    readFile(options.casePath, "utf8"),
    readFile(options.recorderPath, "utf8"),
    readFile(options.policyPath, "utf8"),
  ]);
  const caseInput = parseAuditCase(JSON.parse(caseText));
  const recorderInstruments = parseRecorderCsv(recorderText);
  const policy = parsePolicyBundle(JSON.parse(policyText));
  const report = generateIntegrityReport(caseInput, recorderInstruments, policy, new Date().toISOString());
  const markdown = renderIntegrityReportMarkdown(report);

  await mkdir(options.outDir, { recursive: true });
  await Promise.all([
    writeFile(resolve(options.outDir, "integrity-report.json"), `${JSON.stringify(report, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    }),
    writeFile(resolve(options.outDir, "integrity-report.md"), markdown, {
      encoding: "utf8",
      flag: "wx",
    }),
  ]);
  process.stdout.write(`Wrote integrity-report.json and integrity-report.md to ${options.outDir}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`FairProcess audit failed: ${message}\n`);
  process.exitCode = 1;
});
