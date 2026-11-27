import fs from "node:fs";
import path from "node:path";

const INDEXNOW_KEY = "7d9c4b2e8a1f4c6e9b3d5a7c1e3f5a9b";
const siteUrlArg = process.argv[2];

if (!siteUrlArg) {
  console.error("Usage: node scripts/submit_indexnow.mjs https://your-live-domain.vercel.app");
  process.exit(1);
}

const baseUrl = siteUrlArg.replace(/\/+$/, "");
const host = new URL(baseUrl).host;

// Parse slugs cleanly from src/data/templates.ts
const templatesFile = fs.readFileSync(
  path.join(process.cwd(), "src", "data", "templates.ts"),
  "utf8"
);
const slugMatches = Array.from(templatesFile.matchAll(/slug:\s*"([^"]+)"/g)).map(
  (m) => m[1]
);

const urlList = [
  baseUrl,
  `${baseUrl}/templates`,
  `${baseUrl}/pricing`,
  ...slugMatches.map((slug) => `${baseUrl}/templates/${slug}`),
];

const payload = {
  host,
  key: INDEXNOW_KEY,
  keyLocation: `${baseUrl}/${INDEXNOW_KEY}.txt`,
  urlList,
};

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

const text = await res.text();
console.log(`IndexNow status: ${res.status} (${urlList.length} URLs submitted)`);
if (text) console.log("Response:", text);
