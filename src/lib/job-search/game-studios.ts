/**
 * Game studios with momentum, grouped by company rather than by game: who
 * makes the title matters more for a job search than the title itself.
 *
 * Sources: new games breaking into the US App Store charts, and Steam games
 * whose player counts grew over the last three months.
 */

import { normalizeCompany } from "./application-guard";
import type { ChartApp, SteamGame, StudioBoard } from "./market-sources";

const DAY_MS = 86_400_000;
/** A mobile game this new that is already charting is a breakout. */
const BREAKOUT_DAYS = 365;
/** Steam growth worth calling momentum, and the floor below which percentages are noise. */
const STEAM_MIN_GROWTH = 0.25;
const STEAM_MIN_PLAYERS = 1000;

export interface StudioTitle {
  name: string;
  platform: "Mobile" | "PC";
  signal: string;
  url: string;
  score: number;
}

export interface Studio {
  key: string;
  name: string;
  titles: StudioTitle[];
  score: number;
  /** The developer's own website, from the App Store, when it lists one. */
  website?: string | null;
  /** Filled in by the collector: the studio's public job board, when one is found. */
  board?: StudioBoard | null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = (iso: string) => { const d = new Date(iso + "T12:00:00Z"); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`; };

/**
 * Mobile breakouts outscore PC growth on raw numbers, so without a floor the
 * list is all mobile. These slots keep PC studios on it.
 */
const PC_SLOTS = 4;

export function groupGameStudios(input: { apps: ChartApp[]; steam: SteamGame[]; now: Date; limit?: number }): Studio[] {
  const { apps, steam, now } = input;
  const studios = new Map<string, Studio>();
  const add = (company: string, title: StudioTitle, website?: string | null) => {
    const key = normalizeCompany(company);
    if (!key) return;
    const s = studios.get(key) ?? { key, name: company.replace(/\s+/g, " ").trim(), titles: [], score: 0 };
    s.titles.push(title);
    s.website ??= website ?? null;
    s.score += title.score;
    studios.set(key, s);
  };

  for (const a of apps) {
    const gameRanks = Object.entries(a.ranks).filter(([chart]) => chart.endsWith("games"));
    if (!gameRanks.length || !a.releasedOn) continue;
    if ((now.getTime() - Date.parse(a.releasedOn)) / DAY_MS > BREAKOUT_DAYS) continue;
    // Grossing rank first when there is one: a game that earns is likelier to staff up.
    const grossing = gameRanks.some(([c]) => c.startsWith("Top grossing"));
    const [chart, rank] = gameRanks.filter(([c]) => !grossing || c.startsWith("Top grossing")).sort((x, y) => x[1] - y[1])[0];
    add(a.developer, {
      name: a.name,
      platform: "Mobile",
      signal: `#${rank} ${chart.startsWith("Top grossing") ? "grossing" : "free"}, out ${day(a.releasedOn)}`,
      url: a.url,
      score: (grossing ? 3 : 2) * (rank <= 10 ? 1.5 : rank <= 50 ? 1 : 0.7),
    }, a.sellerUrl);
  }

  for (const g of steam) {
    if (!g.playersThen || g.playersThen < STEAM_MIN_PLAYERS) continue;
    const growth = g.players / g.playersThen - 1;
    if (growth < STEAM_MIN_GROWTH) continue;
    add(g.developer || g.publisher, {
      name: g.name,
      platform: "PC",
      signal: `players +${Math.round(growth * 100)}% in 3 months`,
      url: `https://steamcharts.com/app/${g.appid}`,
      score: Math.min(3, 1 + growth),
    });
  }

  const limit = input.limit ?? 12;
  const ranked = [...studios.values()]
    .map((s) => ({ ...s, titles: s.titles.sort((a, b) => b.score - a.score) }))
    .sort((a, b) => b.score - a.score);
  const pc = ranked.filter((s) => s.titles.some((t) => t.platform === "PC")).slice(0, PC_SLOTS);
  const rest = ranked.filter((s) => !pc.includes(s)).slice(0, limit - pc.length);
  return [...rest, ...pc].sort((a, b) => b.score - a.score);
}
