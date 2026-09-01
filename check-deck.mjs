import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const markdown = readFileSync(join(currentDir, "slides.md"), "utf8");
const html = readFileSync(join(currentDir, "index.html"), "utf8");
const errors = [];

const markdownSlides = markdown
  .split(/\n---\n/)
  .filter((block) => /^## \d{2}\./m.test(block))
  .map((block) => {
    const heading = block.match(/^## (\d{2})\. (.+)$/m);
    return {
      number: Number(heading?.[1]),
      title: heading?.[2]?.trim(),
      block,
    };
  });

const htmlSlides = [...html.matchAll(/<section class="slide [^>]+data-slide="(\d+)" data-title="([^"]+)"/g)].map(
  (match) => ({ number: Number(match[1]), title: match[2] }),
);

if (markdownSlides.length !== 37) errors.push(`Markdown has ${markdownSlides.length} slides, expected 37`);
if (htmlSlides.length !== 37) errors.push(`HTML has ${htmlSlides.length} slides, expected 37`);

for (let index = 0; index < markdownSlides.length; index += 1) {
  const slide = markdownSlides[index];
  if (slide.number !== index + 1) errors.push(`Markdown sequence breaks at ${slide.number}`);
  for (const section of ["屏幕内容", "讲者备注", "依据"]) {
    if (!slide.block.includes(`### ${section}`)) errors.push(`Slide ${slide.number} misses ${section}`);
  }
  if (slide.number < 37 && !slide.block.includes("### 过渡")) {
    errors.push(`Slide ${slide.number} misses 过渡`);
  }
  const generated = htmlSlides[index];
  if (!generated || generated.number !== slide.number || generated.title !== slide.title) {
    errors.push(`Slide ${slide.number} title differs between Markdown and HTML`);
  }
}

for (const required of [
  '<html lang="zh-CN">',
  'name="viewport"',
  'Generated from slides.md by build-html.mjs',
  'class="reveal"',
  'class="slides"',
  './vendor/reveal.js/reveal.css',
  './vendor/reveal.js/reveal.js',
  './vendor/reveal.js/notes.js',
  'new Reveal({',
  '@media print',
  'window.__deckAudit',
]) {
  if (!html.includes(required)) errors.push(`HTML misses ${required}`);
}

if (/<(?:script|link)[^>]+(?:src|href)="https?:/i.test(html)) {
  errors.push("HTML has an external runtime dependency");
}
if (html.includes("@@SLIDE_TOKEN_")) errors.push("HTML has an unresolved inline token");

for (const file of ["reveal.css", "reveal.js", "notes.js", "LICENSE"]) {
  if (!existsSync(join(currentDir, "vendor", "reveal.js", file))) {
    errors.push(`Local Reveal.js asset is missing: ${file}`);
  }
}

const visualCount = (html.match(/<figure class="visual /g) ?? []).length;
if (visualCount < 7) errors.push(`HTML has ${visualCount} explanatory visuals, expected at least 7`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `deck check passed: 37 slides, ${visualCount} explanatory visuals, aligned titles, complete notes, self-contained HTML`,
);
