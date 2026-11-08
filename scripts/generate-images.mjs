/**
 * Generates the app's pictures of invented games and places with FLUX on Workers AI.
 * People's photos come from Pexels instead: see docs/IMAGE-CREDITS.md.
 * Run from this folder: node scripts/generate-images.mjs
 * It uses Telar's public image endpoint, which allows 4 images per minute, and skips existing files.
 * To replace a picture, delete its file and run this again. Results vary, so it can take a few tries,
 * and some of the pictures in the app were cropped by hand afterwards.
 */
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ENDPOINT = "https://telar.fsucatti-portfolio.workers.dev/api/image";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
const WAIT_MS = 16_000;
const CLEAN = "no people, no characters, no text, no letters, no signs, no billboards, no logo, no watermark";

const keyArt = (scene) => `Cinematic video game key art of ${scene}, wide establishing shot, subject in the middle of the frame, high detail, ${CLEAN}`;
const place = (scene) => `Atmospheric digital matte painting of ${scene}, wide composition, subject in the middle of the frame, ${CLEAN}`;
const screenshot = (scene) => `In-game screenshot from a modern competitive video game, ${scene}, crisp 3D graphics, no interface, no HUD, no text, no signs, no logo, no watermark`;

const IMAGES = [
  // Game art: job cards and game pages. Three scenes per game, so a game's listings don't all look alike.
  ...[
    ["wrackline", "a drowned coastal kingdom at low tide, barnacled stone towers and a shipwreck on wet sand, tide pools reflecting a pink dusk sky, lanterns on rusted chains"],
    ["wrackline-narrows", "a narrow flooded sea channel between mossy cliffs with a collapsed stone bridge, turquoise water surging through at high tide, gulls in the distance"],
    ["wrackline-bell", "an enormous green bronze ship's bell hanging from a ruined lighthouse above rising black waves, moonlight, sea spray"],
    ["deadband", "a lonely Cold War radio relay station on a snowy ridge at dusk, a giant steel lattice antenna tower with red warning lights, realistic military thriller mood, teal and orange grade"],
    ["deadband-exchange", "an eye level view down a long aisle between tall rows of vintage telephone switchboards covered with thousands of cables, red emergency lighting, dust in the air, tactical shooter map"],
    ["deadband-tower", "a brutalist concrete communications tower with rooftop satellite dishes against a storm front, a single searchlight, tactical shooter map"],
    ["curfew", "a rain-soaked port city at night seen from a rooftop, searchlights sweeping across the sky, one district of sodium streetlights going dark, cranes on the horizon"],
    ["curfew-gate", "a huge corrugated steel security gate half closed across an empty wet city street at night, red rotating siren lights, reflections on the asphalt, small drones in the air"],
    ["curfew-dawn", "the skyline of a port city at first light after a long night, thin smoke over the rooftops, pale orange dawn behind the harbor cranes"],
    ["railhead", "a side view of a long armored steam locomotive with its whole train crossing a steel trestle bridge across a red canyon, 1880s, smoke trailing behind, painterly strategy game art"],
    ["railhead-yard", "an aerial view of a frontier rail yard at golden hour, dozens of railway tracks converging into one junction, steam trains on the tracks, wooden water tower, cannons on flatcars, painterly strategy game art"],
    ["railhead-snow", "an armored snow plough train pushing through a blizzard in a mountain pass at night, a bright headlamp, sparks from the smokestack, painterly strategy game art"],
  ].map(([name, scene]) => ({ file: `banners/${name}.webp`, prompt: keyArt(scene), width: 960, height: 300 })),
  // Where each team comes from: team cards and team pages.
  ...[
    ["team-gambiarra", "a colorful hillside street in Recife, Brazil at dusk, painted houses, a chaotic tangle of overhead electrical wires and power poles, warm yellow light"],
    ["team-undertow", "a dark Atlantic harbor at night, a stone breakwater with a small lighthouse, rough navy blue water and rolling fog, a ferry terminal with warm lights"],
    ["team-b2", "long rows of glowing computer monitors showing abstract colors and empty black gaming chairs in a low-ceilinged concrete basement at night, warm amber desk lights, instant noodle cups on the desks, blank walls"],
    ["team-kaamos", "the blue polar night in Finnish Lapland, snow-loaded pine trees, a faint green aurora low on the horizon, a small cabin with one warm window"],
    ["team-latencia", "a corner in an old Buenos Aires neighborhood at night seen from across the street, a two-story Art Deco corner building with a warmly lit cafe on the ground floor, maroon and cream paint, plane trees, cobblestones and old tram rails, warm streetlamps"],
    ["team-second-monitor", "a messy home desk at night seen straight on, one wide monitor and one tall vertical monitor side by side, both glowing with abstract coral and violet gradients, coffee mugs and cables, a dark room lit in coral pink"],
  ].map(([name, scene]) => ({ file: `banners/${name}.webp`, prompt: place(scene), width: 960, height: 300 })),
  // Highlight thumbnails on player profiles.
  ...[
    ["tide", "top-down isometric view of a five-on-five fantasy battle on wet sand between ruined stone towers, glowing spell effects, sea water rushing in from the edges"],
    ["shoal", "top-down isometric view of tiny heroes wading across a shallow turquoise shoal beside a mossy watchtower, a wooden rope bridge, spell effects"],
    ["beached", "top-down isometric view of a lone tiny hero stranded on a small sand island surrounded by rising turquoise water, ruined stone towers on nearby islands, a wrecked rowing boat, glowing spell effect"],
    ["retake", "first-person view moving through a dark radio relay room lit by red emergency lights, racks of old electronics, a blinking device on the floor at the far end, a rifle in the foreground"],
    ["sirens", "third-person view over a wet rooftop edge, a rainy port city at night with searchlights and red siren lights in the streets below, plain dark buildings, a steel gate closing far away"],
    ["junction", "top-down real-time strategy view of a steam-era battle around a railway junction, small trains, artillery, tiny soldiers, explosions on a canyon rim"],
  ].map(([name, scene]) => ({ file: `highlights/${name}.webp`, prompt: screenshot(scene), width: 640, height: 360 })),
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
  // The model only makes square pictures, so this keeps the most interesting band of each one.
  await sharp(bytes).resize(width, height, { fit: "cover", position: sharp.strategy.attention }).webp({ quality: 80 }).toFile(target);
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
