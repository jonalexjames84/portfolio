#!/usr/bin/env node
/**
 * Push documents/ into the Materials tab.
 *
 * documents/ is gitignored and .vercelignore'd (this repo is public), so the
 * deployed site has no way to read a resume or cover letter off disk. This
 * script is the bridge: it walks the folders, upserts a row per material into
 * job_materials, and uploads the PDFs to a private Supabase Storage bucket.
 *
 *   node scripts/sync-materials.mjs [--dry-run] [--verbose]
 *
 * It is safe to run constantly — that's the point. A Claude Code hook fires it
 * whenever anything under documents/ is written, so content hashes decide what
 * actually gets re-uploaded.
 *
 * Adding a new folder is one entry in SOURCES below.
 */

import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUCKET = "job-materials";

/**
 * Folders the sync owns. `recursive` picks up the cover-letters/pdf/ subfolder.
 * `match` keeps documents/ root from sweeping in every stray file.
 */
const SOURCES = [
  { dir: "documents/resumes", type: "resume", recursive: true },
  { dir: "documents/applications/cover-letters", type: "cover_letter", recursive: true },
  { dir: "documents", type: "resume", recursive: false, match: /resume/i },
];

const EXTENSIONS = new Set([".md", ".pdf", ".html"]);
const FORMATS = { ".md": "markdown", ".html": "html", ".pdf": "pdf" };

/** Name fragments that describe the resume itself, not a company it targets. */
const GENERIC_TOKENS = new Set(["pm", "spm", "senior", "product", "manager", "resume", "cv", "jon", "martin"]);

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const VERBOSE = args.has("--verbose") || DRY_RUN;

// ---------------------------------------------------------------- env

function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("sync-materials: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

// ---------------------------------------------------------------- helpers

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Storage object keys: keep them recognisable but free of spaces and quotes. */
function storageKey(relPath) {
  return relPath.replace(/[^A-Za-z0-9._/-]+/g, "-");
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|tr|section|header)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function titleize(slug) {
  return slug
    .split("-")
    .map((word) => (word.length <= 2 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)))
    .join(" ");
}

async function walk(absDir, recursive, out = []) {
  let entries;
  try {
    entries = await readdir(absDir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const abs = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) await walk(abs, recursive, out);
      continue;
    }
    out.push(abs);
  }
  return out;
}

// ---------------------------------------------------------------- parsing

/**
 * Cover letters carry their own metadata: the first markdown heading is
 * "# Company — Role". Filenames are only a fallback, because a slug like
 * `anthropic-claude-code` can't tell you where the company name ends.
 */
function parseCoverLetter({ slug, text }) {
  const heading = text?.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (heading) {
    const split = heading.match(/^(.+?)\s+[—–|-]\s+(.+)$/);
    if (split) return { company: split[1].trim(), role: split[2].trim() };
    return { company: heading, role: "Cover Letter" };
  }
  return { company: titleize(slug), role: "Cover Letter" };
}

/**
 * Resume filenames come in two shapes: "Resume (AI Builder)" for the reusable
 * variants, and "Figma AI Platform PM Resume" for one aimed at a company. The
 * parenthetical form is unambiguous; the other leans on the first word not
 * being a generic PM-title token.
 */
function parseResume(baseName) {
  const cleaned = baseName.replace(/^jon\s+martin\s*[-—–]\s*/i, "").trim();

  const parenthetical = cleaned.match(/^(?:resume|cv)\s*\((.+)\)$/i);
  if (parenthetical) {
    return { company: "General", role: parenthetical[1].trim(), label: cleaned };
  }

  const withoutSuffix = cleaned.replace(/\s*(resume|cv)\s*$/i, "").trim();
  const firstWord = withoutSuffix.split(/\s+/)[0] || "";

  if (!firstWord || GENERIC_TOKENS.has(firstWord.toLowerCase())) {
    return { company: "General", role: withoutSuffix || "Standard", label: cleaned };
  }

  const remainder = withoutSuffix.slice(firstWord.length).trim();
  return { company: firstWord, role: remainder || "Resume", label: cleaned };
}

/**
 * Groups the files that are really one material. A cover letter is usually a
 * markdown body plus a rendered PDF sitting in a pdf/ subfolder under a
 * differently-shaped name; a targeted resume is an .html source plus its .pdf.
 * Without this they'd show up as two cards for the same letter.
 */
function pairKeyFor(relPath, type) {
  const base = path.basename(relPath, path.extname(relPath));

  if (type === "cover_letter") {
    const parenthetical = base.match(/cover\s*letter\s*\((.+)\)/i);
    if (parenthetical) return `cover:${slugify(parenthetical[1])}`;
    return `cover:${slugify(base)}`;
  }

  return `resume:${slugify(base.replace(/^jon\s+martin\s*[-—–]\s*/i, ""))}`;
}

const bareKey = (key) => key.replace(/^(cover|resume):/, "");

/**
 * PDF names and markdown slugs don't always agree — "Cover Letter (Apple).pdf"
 * belongs to `apple-games.md`. Adopt a stray PDF into a text group when its
 * slug is a prefix of exactly one candidate. Ambiguity (an orphan "anthropic"
 * PDF against three Anthropic letters) is left alone rather than guessed at.
 */
function adoptOrphanPdfs(groups) {
  const all = [...groups.values()];
  const hasText = (g) => g.files.some((f) => f.ext !== ".pdf");
  const hasPdf = (g) => g.files.some((f) => f.ext === ".pdf");

  for (const group of all) {
    if (hasText(group)) continue;
    const slug = bareKey(group.key);

    const candidates = all.filter((other) => {
      if (other === group || other.type !== group.type) return false;
      if (!hasText(other) || hasPdf(other)) return false;
      const otherSlug = bareKey(other.key);
      return otherSlug.startsWith(`${slug}-`) || slug.startsWith(`${otherSlug}-`);
    });

    if (candidates.length !== 1) continue;
    candidates[0].files.push(...group.files);
    groups.delete(group.key);
  }
}

// ---------------------------------------------------------------- collect

async function collect() {
  const groups = new Map();

  for (const source of SOURCES) {
    const absDir = path.join(ROOT, source.dir);
    for (const abs of await walk(absDir, source.recursive)) {
      const ext = path.extname(abs).toLowerCase();
      if (!EXTENSIONS.has(ext)) continue;

      const relPath = path.relative(ROOT, abs);
      if (source.match && !source.match.test(path.basename(abs))) continue;
      // documents/ root is scanned last and non-recursively; don't let it
      // re-claim a file a more specific source already took.
      if ([...groups.values()].some((g) => g.files.some((f) => f.relPath === relPath))) continue;

      const key = pairKeyFor(relPath, source.type);
      if (!groups.has(key)) groups.set(key, { key, type: source.type, files: [] });

      const info = await stat(abs);
      groups.get(key).files.push({
        abs,
        relPath,
        ext,
        bytes: info.size,
        modifiedAt: info.mtime,
      });
    }
  }

  adoptOrphanPdfs(groups);

  const materials = [];

  for (const group of groups.values()) {
    const text = group.files.find((f) => f.ext === ".md") || group.files.find((f) => f.ext === ".html");
    const pdf = group.files.find((f) => f.ext === ".pdf");
    const primary = text || pdf;
    if (!primary) continue;

    const raw = await readFile(primary.abs);
    const content =
      primary.ext === ".md"
        ? raw.toString("utf8")
        : primary.ext === ".html"
          ? stripTags(raw.toString("utf8"))
          : null;

    const baseName = path.basename(primary.relPath, primary.ext);
    const meta =
      group.type === "cover_letter"
        ? { ...parseCoverLetter({ slug: slugify(baseName), text: content }), label: null }
        : parseResume(baseName);

    // The downloadable artifact: the PDF when there is one, otherwise the
    // HTML source. Markdown-only letters need no upload — the text is the
    // material, and the modal already renders and copies it.
    const attachment = pdf || (primary.ext === ".html" ? primary : null);

    const modifiedAt = group.files.reduce(
      (latest, f) => (f.modifiedAt > latest ? f.modifiedAt : latest),
      group.files[0].modifiedAt
    );

    // Hash the attachment's bytes, not its length. Re-rendering a PDF often
    // lands on the identical byte count while the content differs, and a
    // length-based hash silently leaves the stale file in storage.
    const attachmentBytes =
      attachment && attachment !== primary ? await readFile(attachment.abs) : Buffer.alloc(0);

    materials.push({
      source_path: primary.relPath,
      type: group.type,
      company: meta.company,
      role: meta.role,
      label: meta.label || `${meta.company} — ${meta.role}`,
      format: FORMATS[primary.ext],
      content,
      content_hash: createHash("sha256").update(raw).update(attachmentBytes).digest("hex"),
      storage_path: attachment ? storageKey(attachment.relPath) : null,
      file_bytes: attachment?.bytes ?? primary.bytes,
      file_modified_at: modifiedAt.toISOString(),
      origin: "repo",
      _attachmentAbs: attachment?.abs ?? null,
      _attachmentExt: attachment?.ext ?? null,
    });
  }

  return materials.sort((a, b) => a.source_path.localeCompare(b.source_path));
}

// ---------------------------------------------------------------- sync

async function ensureBucket() {
  const { data } = await supabase.storage.listBuckets();
  if (data?.some((b) => b.name === BUCKET)) return;
  if (DRY_RUN) {
    console.log(`  would create private storage bucket "${BUCKET}"`);
    return;
  }
  const { error } = await supabase.storage.createBucket(BUCKET, { public: false });
  // A parallel run may have won the race; only a real failure matters.
  if (error && !/already exists/i.test(error.message)) throw error;
  console.log(`  created private storage bucket "${BUCKET}"`);
}

async function main() {
  const materials = await collect();

  const { data: existing, error: fetchError } = await supabase
    .from("job_materials")
    .select("id, source_path, content_hash, storage_path")
    .eq("origin", "repo");

  if (fetchError) throw fetchError;

  const bySourcePath = new Map((existing || []).map((row) => [row.source_path, row]));
  const seen = new Set();
  let inserted = 0;
  let updated = 0;
  let unchanged = 0;
  let uploaded = 0;

  if (materials.some((m) => m.storage_path)) await ensureBucket();

  for (const material of materials) {
    seen.add(material.source_path);
    const { _attachmentAbs, _attachmentExt, ...row } = material;
    const prior = bySourcePath.get(material.source_path);

    if (prior && prior.content_hash === material.content_hash && prior.storage_path === material.storage_path) {
      unchanged += 1;
      continue;
    }

    if (_attachmentAbs && material.storage_path) {
      if (DRY_RUN) {
        console.log(`  would upload ${material.storage_path}`);
      } else {
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(material.storage_path, await readFile(_attachmentAbs), {
            upsert: true,
            contentType: _attachmentExt === ".pdf" ? "application/pdf" : "text/html",
          });
        if (error) throw new Error(`upload ${material.storage_path}: ${error.message}`);
      }
      uploaded += 1;
    }

    if (DRY_RUN) {
      console.log(`  would ${prior ? "update" : "insert"} ${material.label} (${material.source_path})`);
    } else if (prior) {
      const { error } = await supabase
        .from("job_materials")
        .update({ ...row, synced_at: new Date().toISOString() })
        .eq("id", prior.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("job_materials").insert({
        ...row,
        synced_at: new Date().toISOString(),
        // Order the grid by when Jon wrote the thing, not when the sync first
        // happened to notice it.
        created_at: material.file_modified_at,
      });
      if (error) throw error;
    }

    if (prior) updated += 1;
    else inserted += 1;
  }

  // Prune rows whose file is gone. Scoped to origin='repo' so materials the
  // /cover-letter and /resume-tailor skills POST directly are never touched.
  const stale = (existing || []).filter((row) => !seen.has(row.source_path));
  if (stale.length) {
    const orphanedObjects = stale.map((row) => row.storage_path).filter(Boolean);
    if (DRY_RUN) {
      for (const row of stale) console.log(`  would remove ${row.source_path}`);
    } else {
      if (orphanedObjects.length) await supabase.storage.from(BUCKET).remove(orphanedObjects);
      const { error } = await supabase
        .from("job_materials")
        .delete()
        .in("id", stale.map((row) => row.id));
      if (error) throw error;
    }
  }

  const summary = [
    `${materials.length} materials`,
    inserted ? `${inserted} added` : null,
    updated ? `${updated} updated` : null,
    stale.length ? `${stale.length} removed` : null,
    uploaded ? `${uploaded} files uploaded` : null,
    unchanged ? `${unchanged} unchanged` : null,
  ].filter(Boolean);

  console.log(`${DRY_RUN ? "[dry run] " : ""}sync-materials: ${summary.join(", ")}`);

  if (VERBOSE && materials.length) {
    for (const material of materials) {
      console.log(`  ${material.type.padEnd(13)} ${material.company} — ${material.role}`);
    }
  }
}

main().catch((error) => {
  console.error(`sync-materials failed: ${error.message}`);
  process.exit(1);
});
