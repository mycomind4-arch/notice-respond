import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, "..");
const publicDir = resolve(appRoot, "public");
const distDir = resolve(appRoot, "dist");

const googleClientId = process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID_PLACEHOLDER";

// ── Build ────────────────────────────────────────────────────────────────────
await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(publicDir, distDir, { recursive: true });

// Inject Google Client ID into index.html
const indexPath = resolve(distDir, "index.html");
let html = await readFile(indexPath, "utf8");
html = html.replace("GOOGLE_CLIENT_ID_PLACEHOLDER", googleClientId);
await writeFile(indexPath, html, "utf8");

// Fix live workspace references for production
const liveHtmlPath = resolve(distDir, "live.html");
const liveScriptPath = resolve(distDir, "live.js");
let liveHtml = (await readFile(liveHtmlPath, "utf8"))
  .replace("Authorize review", "Authorize report")
  .replace("http://localhost:3001", "https://fairprocess-api.mailmypdf.workers.dev");
const liveScript = (await readFile(liveScriptPath, "utf8")).replace(
  "Report moved to human review",
  "Report authorized",
);
await writeFile(liveHtmlPath, liveHtml, "utf8");
await writeFile(liveScriptPath, liveScript, "utf8");

console.log(`Built FairProcess web artifact at ${distDir}`);
