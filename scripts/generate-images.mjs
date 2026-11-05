/**
 * Generates the app's pictures of invented games with FLUX on Workers AI.
 * People's photos come from Pexels instead: see docs/IMAGE-CREDITS.md.
 * Run from this folder: node scripts/generate-images.mjs
 * It uses Telar's public image endpoint, which allows 4 images per minute, and skips existing files.
 */
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ENDPOINT = "https://telar.fsucatti-portfolio.workers.dev/api/image";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
const WAIT_MS = 16_000;

const banner = (scene) =>
  `Wide atmospheric fantasy video game concept art of ${scene}, dramatic lighting, painterly, no characters, no text, no logo, no watermark`;
const gameplay = (scene) =>
  `Top-down isometric video game screenshot of ${scene}, glowing spell effects, stylized fantasy arena, original game, no text, no interface, no logo`;

const IMAGES = [
  ...[
    ["ember", "a volcanic cavern with rivers of red lava and an ancient gate"],
    ["storm", "a violent electric purple and blue lightning storm over a dark sea"],
    ["jade", "a ruined jungle fortress at night lit by glowing green runes"],
    ["frost", "an icy mountain citadel under pale blue northern lights"],
    ["dusk", "a desert city of sandstone towers under a burning orange sunset"],
    ["void", "a floating dark magenta crystal nebula above a broken planet"],
  ].map(([name, scene]) => ({ file: `banners/${name}.webp`, prompt: banner(scene), width: 960, height: 300 })),
  ...[
    ["clash", "two teams of tiny heroes fighting at a red magic circle in the center of a stone arena"],
    ["river", "a small group of heroes crossing a blue river beside a mossy tower"],
    ["forest", "a lone hero sneaking along a dirt path through a dark green forest"],
    ["siege", "heroes attacking a glowing purple crystal base with bright explosions"],
  ].map(([name, scene]) => ({ file: `highlights/${name}.webp`, prompt: gameplay(scene), width: 640, height: 360 })),
];

async function generate({ prompt, file, width, height }) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  const { image } = await response.json();
  const bytes = Buffer.from(image.split(",")[1], "base64");
  const target = join(OUT, file);
  mkdirSync(dirname(target), { recursive: true });
  await sharp(bytes).resize(width, height, { fit: "cover" }).webp({ quality: 80 }).toFile(target);
}

let failures = 0;
for (const item of IMAGES) {
  if (existsSync(join(OUT, item.file))) continue;
  try {
    await generate(item);
    console.log("saved", item.file);
  } catch (error) {
    failures++;
    console.error("failed", item.file, error.message);
  }
  await new Promise((resolve) => setTimeout(resolve, WAIT_MS));
}
console.log(failures ? `Finished with ${failures} failures. Run it again to retry them.` : "All images ready.");
