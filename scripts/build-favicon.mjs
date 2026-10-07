import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const svg = await readFile(path.join(root, "public/favicon.svg"));
const src = `data:image/svg+xml;base64,${svg.toString("base64")}`;
const sizes = [16, 32, 48, 64];
const images = [];
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const size of sizes) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0"><img src="${src}" width="${size}" height="${size}"></body></html>`);
    await page.locator("img").evaluate((image) => image.decode());
    images.push(await page.screenshot({ type: "png" }));
  }
  await page.setViewportSize({ width: 256, height: 256 });
  await page.setContent(`<html><body style="margin:0"><img src="${src}" width="256" height="256"></body></html>`);
  await page.locator("img").evaluate((image) => image.decode());
  await writeFile(path.join(root, "release/favicon-preview.png"), await page.screenshot({ type: "png" }));
} finally {
  await browser.close();
}

const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + images.length * 16;
const entries = images.map((png, index) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(sizes[index], 0);
  entry.writeUInt8(sizes[index], 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  return entry;
});
await writeFile(path.join(root, "public/favicon.ico"), Buffer.concat([header, ...entries, ...images]));
console.log("Created VenueBox favicon.ico from favicon.svg");
