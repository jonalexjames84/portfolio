/**
 * Read the 100-Day Plan's Friday Seven rows from Notion.
 *
 * Needs NOTION_API_KEY: an internal integration that the "100-Day Plan: Run the
 * Machine" page is shared with (the Friday Seven database inherits it).
 */

import {
  FRIDAY_SEVEN_FIELDS,
  rowMatchesWeek,
  type FridaySevenNumbers,
  type PlanBlock,
} from "./quest-sheet";

export const FRIDAY_SEVEN_DB = "c9bf162e393444f08b14c408e23d915b";
const NOTION_VERSION = "2022-06-28";

export interface WeekRow {
  id: string;
  url: string;
  title: string;
  numbers: FridaySevenNumbers;
}

async function notion<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.NOTION_API_KEY;
  if (!key) throw new Error("NOTION_API_KEY is not set; the quest sheet can't read the Friday Seven");
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Notion ${path} → ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

type RichText = { plain_text: string }[];
const plain = (rt: RichText | undefined) => (rt ?? []).map((t) => t.plain_text).join("");

interface NotionPage {
  id: string;
  url: string;
  properties: Record<string, { type: string; title?: RichText; number?: number | null }>;
}

export async function findWeekRow(week: number): Promise<WeekRow | null> {
  const { results } = await notion<{ results: NotionPage[] }>(`/databases/${FRIDAY_SEVEN_DB}/query`, {
    method: "POST",
    body: JSON.stringify({ page_size: 100 }),
  });
  for (const page of results) {
    const titleProp = Object.values(page.properties).find((p) => p.type === "title");
    const title = plain(titleProp?.title);
    if (!rowMatchesWeek(title, week)) continue;
    const numbers: FridaySevenNumbers = {};
    for (const f of [...FRIDAY_SEVEN_FIELDS, "Listed", "Sold"] as const) {
      numbers[f] = page.properties[f]?.number ?? null;
    }
    return { id: page.id, url: page.url, title, numbers };
  }
  return null;
}

interface NotionBlock {
  type: string;
  [key: string]: unknown;
}

export async function readPlanBlocks(pageId: string): Promise<PlanBlock[]> {
  const blocks: PlanBlock[] = [];
  let cursor: string | undefined;
  do {
    const qs = new URLSearchParams({ page_size: "100", ...(cursor ? { start_cursor: cursor } : {}) });
    const res = await notion<{ results: NotionBlock[]; has_more: boolean; next_cursor: string | null }>(
      `/blocks/${pageId}/children?${qs}`,
    );
    for (const b of res.results) {
      const body = b[b.type] as { rich_text?: RichText; checked?: boolean } | undefined;
      const text = plain(body?.rich_text);
      if (b.type.startsWith("heading_")) blocks.push({ type: "heading", text });
      else if (b.type === "to_do") blocks.push({ type: "todo", text, checked: body?.checked ?? false });
      else blocks.push({ type: "other", text });
    }
    cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
  } while (cursor);
  return blocks;
}
