#!/usr/bin/env node
/**
 * Render the sendable PDF for every application material.
 *
 * Until now these were produced by throwaway Chromium print jobs typed at the
 * terminal, which is why five letters never got one and nothing was
 * reproducible. This script is that process, committed.
 *
 *   node scripts/render-pdfs.mjs [--all] [--only <slug>] [--dry-run]
 *
 * By default it only renders what's missing. `--all` regenerates every PDF,
 * which is what you want after changing the template.
 *
 * THE IMPORTANT PART: a cover letter's markdown opens with internal notes —
 * JD verification, comp, "honest gap", "you already applied here." Those are
 * written to Jon, not to the company. Everything above the `---` rule is
 * dropped, and a letter with no `---` is refused rather than rendered with the
 * notes still in it.
 */

import { chromium } from "playwright";
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LETTERS_DIR = path.join(ROOT, "documents/applications/cover-letters");
const LETTER_PDF_DIR = path.join(LETTERS_DIR, "pdf");
const RESUMES_DIR = path.join(ROOT, "documents/resumes");

const CONTACT = {
  name: "Jon Martin",
  title: "Senior Product Manager",
  location: "Bay Area / Remote",
  email: "jonalexjames@gmail.com",
  phone: "(650) 627-6352",
  site: "portfolio.jonnymartin.blog",
};

const argv = process.argv.slice(2);
const args = new Set(argv);
const ALL = args.has("--all");
const DRY_RUN = args.has("--dry-run");
const ONLY = argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : null;

// ---------------------------------------------------------------- markdown

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Inline markdown actually used in these letters: bold, italic, code. */
function inline(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Straight quotes and hyphens read as typewriter output in a letter.
    .replace(/(\w)'(\w)/g, "$1’$2")
    .replace(/ -- /g, " — ");
}

function markdownToHtml(markdown) {
  const blocks = markdown.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return blocks
    .map((block) => {
      const heading = block.match(/^(#{2,6})\s+(.*)$/);
      if (heading) {
        const level = Math.min(heading[1].length, 4);
        return `<h${level}>${inline(heading[2])}</h${level}>`;
      }
      if (/^---+$/.test(block)) return "<hr />";
      // Soft-wrap inside a paragraph is authoring convenience, not a line break.
      return `<p>${inline(block.replace(/\n/g, " "))}</p>`;
    })
    .join("\n");
}

// ---------------------------------------------------------------- letters

/**
 * Splits a letter into the part meant for the company and the part meant for
 * Jon. Returns null when the `---` separator is missing, because guessing
 * would risk printing "you already applied here with no logged response" onto
 * a letter that gets sent.
 */
function parseLetter(markdown) {
  const separator = markdown.match(/^---+$/m);
  if (!separator) return null;

  const headingLine = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || "";
  const split = headingLine.match(/^(.+?)\s+[—–|-]\s+(.+)$/);
  const company = (split ? split[1] : headingLine).trim();
  const role = split ? split[2].trim() : "";

  let body = markdown.slice(separator.index + separator[0].length).trim();

  // The markdown ends with a plain-text signature. The rendered letter puts
  // that in a styled footer instead, so strip it rather than printing the
  // name and phone number twice.
  const contact = new RegExp(
    `\\n+${CONTACT.name}\\s*\\n+[^\\n]*(?:${CONTACT.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}|\\(\\d{3}\\))[^\\n]*\\s*$`,
    "i"
  );
  body = body.replace(contact, "").trim();

  return { company, role, body };
}

/**
 * Density ladder. A cover letter that runs onto a second page reads as
 * padding, so instead of picking one font size and hoping, each letter is
 * measured and rendered at the loosest setting that still fits on one page.
 * Step 0 matches the density of the letters Jon has already sent.
 */
const DENSITY = [
  { fontSize: "10.5pt", lineHeight: 1.62, gap: "11px", headerGap: "22px" },
  { fontSize: "10.2pt", lineHeight: 1.55, gap: "9.5px", headerGap: "19px" },
  { fontSize: "9.9pt", lineHeight: 1.5, gap: "8px", headerGap: "16px" },
  { fontSize: "9.5pt", lineHeight: 1.45, gap: "7px", headerGap: "14px" },
];

const PAGE = {
  marginY: 0.75,
  marginX: 0.9,
  widthIn: 8.5,
  heightIn: 11,
  dpi: 96,
};

const CONTENT_WIDTH_PX = Math.floor((PAGE.widthIn - PAGE.marginX * 2) * PAGE.dpi);
const CONTENT_HEIGHT_PX = Math.floor((PAGE.heightIn - PAGE.marginY * 2) * PAGE.dpi);

const LETTER_CSS = `
  @page { size: Letter; margin: ${PAGE.marginY}in ${PAGE.marginX}in; }
  * { box-sizing: border-box; }
  body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: var(--fs);
    line-height: var(--lh);
    color: #22252a;
    margin: 0;
    -webkit-font-smoothing: antialiased;
  }
  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 24px;
    border-bottom: 2.5px solid #111318;
    padding-bottom: 9px;
    margin-bottom: var(--header-gap);
  }
  header .name {
    font-size: 23pt;
    font-weight: 700;
    letter-spacing: -0.6px;
    color: #0d0f13;
    white-space: nowrap;
  }
  header .contact {
    font-size: 8.5pt;
    color: #55595f;
    text-align: right;
  }
  header .contact span { white-space: nowrap; }
  header .contact .sep { color: #b6bac0; padding: 0 5px; }
  p { margin: 0 0 var(--gap); }
  strong { font-weight: 700; color: #14171c; }
  h2, h3, h4 {
    font-size: var(--fs);
    font-weight: 700;
    color: #14171c;
    margin: 16px 0 6px;
  }
  hr { border: 0; border-top: 1px solid #dfe2e6; margin: 16px 0; }
  code { font-family: "SF Mono", Menlo, monospace; font-size: 9.5pt; }
  footer {
    margin-top: var(--header-gap);
    padding-top: 11px;
    border-top: 1px solid #dfe2e6;
  }
  footer .name { font-weight: 700; color: #14171c; }
  footer .meta { font-size: 9.5pt; color: #55595f; margin-top: 1px; }
  footer .meta .sep { color: #b6bac0; padding: 0 5px; }
  /* Never strand a bold lead-in or a signature alone at a page break. */
  p, h2, h3, h4 { orphans: 3; widows: 3; }
  footer { break-inside: avoid; }
`;

function letterHtml({ company, body }, density = DENSITY[0]) {
  return `<!doctype html>
<html><head><meta charset="utf-8" />
<title>${escapeHtml(CONTACT.name)} — Cover Letter (${escapeHtml(company)})</title>
<style>
:root {
  --fs: ${density.fontSize};
  --lh: ${density.lineHeight};
  --gap: ${density.gap};
  --header-gap: ${density.headerGap};
}
${LETTER_CSS}</style></head>
<body>
  <header>
    <div class="name">${escapeHtml(CONTACT.name)}</div>
    <div class="contact">
      <span>${escapeHtml(CONTACT.email)}</span><span class="sep">|</span><span>${escapeHtml(CONTACT.phone)}</span><span class="sep">|</span><span>${escapeHtml(CONTACT.site)}</span>
    </div>
  </header>
  <main>${markdownToHtml(body)}</main>
  <footer>
    <div class="name">${escapeHtml(CONTACT.name)}</div>
    <div class="meta">${escapeHtml(CONTACT.title)}<span class="sep">·</span>${escapeHtml(CONTACT.location)}</div>
  </footer>
</body></html>`;
}

// ---------------------------------------------------------------- naming

/**
 * Existing PDFs use hand-picked labels that disambiguate two roles at the same
 * company ("Vercel Senior PM" vs "Vercel Accounts"). Reuse the exact filename
 * when one already exists so regenerating overwrites rather than duplicates;
 * fall back to the company from the letter's own heading.
 */
async function letterPdfNames() {
  const existing = existsSync(LETTER_PDF_DIR) ? await readdir(LETTER_PDF_DIR) : [];
  const byLabel = new Map();
  for (const file of existing) {
    const label = file.match(/cover\s*letter\s*\((.+)\)\.pdf$/i)?.[1];
    if (label) byLabel.set(slugify(label), file);
  }
  return byLabel;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------- render

/**
 * Returns the index of the loosest DENSITY step whose rendered letter still
 * fits on one page. Measured under print emulation at the real content box,
 * so it reflects what Chromium will actually paginate. Falls back to the
 * tightest step for a letter that is simply too long — better a full second
 * page than a squinting one.
 */
async function fitToOnePage(page, letter) {
  await page.emulateMedia({ media: "print" });
  await page.setViewportSize({ width: CONTENT_WIDTH_PX, height: CONTENT_HEIGHT_PX });

  for (let index = 0; index < DENSITY.length; index += 1) {
    await page.setContent(letterHtml(letter, DENSITY[index]), { waitUntil: "load" });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    if (height <= CONTENT_HEIGHT_PX) return index;
  }

  return DENSITY.length - 1;
}

/**
 * Work out what needs rendering without touching a browser. The hook runs this
 * script on every documents/ change, and booting Chromium to discover there is
 * nothing to do would make every write a second slower.
 */
async function planLetters(existingNames) {
  const files = (await readdir(LETTERS_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();

  const pending = [];
  const skipped = [];
  const refused = [];

  for (const file of files) {
    const slug = path.basename(file, ".md");
    if (ONLY && slug !== ONLY) continue;

    const letter = parseLetter(await readFile(path.join(LETTERS_DIR, file), "utf8"));
    if (!letter) {
      refused.push(`${file} — no '---' separator, can't tell notes from letter`);
      continue;
    }

    // Prefer an existing filename keyed on the slug, then on the company name.
    const existing = existingNames.get(slug) || existingNames.get(slugify(letter.company));
    const outName = existing || `${CONTACT.name} - Cover Letter (${letter.company}).pdf`;
    const outPath = path.join(LETTER_PDF_DIR, outName);

    if (!ALL && existsSync(outPath)) skipped.push(outName);
    else pending.push({ letter, outName, outPath });
  }

  return { pending, skipped, refused };
}

async function renderLetters(page, pending) {
  const written = [];

  for (const { letter, outName, outPath } of pending) {
    const density = await fitToOnePage(page, letter);
    await page.setContent(letterHtml(letter, DENSITY[density]), { waitUntil: "load" });
    const buffer = await page.pdf({ format: "Letter", printBackground: true, preferCSSPageSize: true });
    await writeFile(outPath, buffer);
    written.push(density > 0 ? `${outName} (tightened \u00d7${density})` : outName);
  }

  return written;
}

/**
 * Smallest print scale that pulls an already-loaded document onto one page.
 *
 * The PostHog resume overruns by about one line — enough for a second page
 * carrying a single row, which looks like a mistake on a resume. A 2–3%
 * reduction is invisible and fixes it. Anything needing more than 10% is
 * genuinely a multi-page document, so it's left alone.
 */
function pdfPageCount(buffer) {
  return Math.max(buffer.toString("latin1").match(/\/Type\s*\/Page[^s]/g)?.length || 0, 1);
}

async function fitScale(page) {
  const SCALES = [1, 0.98, 0.96, 0.94, 0.92, 0.9];

  for (const scale of SCALES) {
    const buffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      preferCSSPageSize: true,
      ...(scale < 1 ? { scale } : {}),
    });
    if (pdfPageCount(buffer) === 1) return { scale, buffer };
  }

  // Genuinely longer than a page — print it at full size rather than shrinking
  // a two-page document into something unreadable.
  const buffer = await page.pdf({ format: "Letter", printBackground: true, preferCSSPageSize: true });
  return { scale: 1, buffer };
}

/**
 * Two resume variants exist only as .html. They're already complete styled
 * documents, so they just need printing — no template applied.
 */
async function planResumes() {
  if (!existsSync(RESUMES_DIR)) return { pending: [], skipped: [] };

  const pending = [];
  const skipped = [];

  for (const file of (await readdir(RESUMES_DIR)).filter((f) => f.endsWith(".html"))) {
    const base = path.basename(file, ".html");
    if (ONLY && slugify(base) !== slugify(ONLY)) continue;

    const outPath = path.join(RESUMES_DIR, `${base}.pdf`);
    if (!ALL && existsSync(outPath)) skipped.push(`${base}.pdf`);
    else pending.push({ file, base, outPath });
  }

  return { pending, skipped };
}

async function renderResumes(page, pending) {
  const written = [];

  for (const { file, base, outPath } of pending) {
    await page.goto(`file://${path.join(RESUMES_DIR, file)}`, { waitUntil: "networkidle" });
    // These documents carry their own @page margins, tuned to fit one page.
    // Overriding them with a uniform margin is what pushed a few lines onto a
    // second page.
    const { scale, buffer } = await fitScale(page);
    await writeFile(outPath, buffer);
    written.push(scale < 1 ? `${base}.pdf (scaled ${Math.round(scale * 100)}%)` : `${base}.pdf`);
  }

  return written;
}

async function main() {
  await mkdir(LETTER_PDF_DIR, { recursive: true });

  const letters = await planLetters(await letterPdfNames());
  const resumes = await planResumes();

  for (const reason of letters.refused) console.error(`  REFUSED ${reason}`);

  const total = letters.pending.length + resumes.pending.length;
  const skipped = letters.skipped.length + resumes.skipped.length;

  const report = (rendered) =>
    console.log(
      `${DRY_RUN ? "[dry run] " : ""}render-pdfs: ${rendered} rendered` +
        (skipped ? `, ${skipped} already present (use --all to regenerate)` : "") +
        (letters.refused.length ? `, ${letters.refused.length} refused` : "")
    );

  if (DRY_RUN) {
    for (const { outName } of letters.pending) console.log(`  would render ${outName}`);
    for (const { base } of resumes.pending) console.log(`  would render ${base}.pdf`);
    report(total);
  } else if (total === 0) {
    report(0);
  } else {
    // Only now is a browser worth the ~1s it costs to start.
    const browser = await chromium.launch();
    const page = await browser.newPage();
    try {
      for (const name of await renderLetters(page, letters.pending)) console.log(`  wrote ${name}`);
      for (const name of await renderResumes(page, resumes.pending)) console.log(`  wrote ${name}`);
      report(total);
    } finally {
      await browser.close();
    }
  }

  if (letters.refused.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`render-pdfs failed: ${error.message}`);
  process.exit(1);
});
