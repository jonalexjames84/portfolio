import { describe, expect, it } from "vitest";
import { groupGameStudios } from "./game-studios";
import { parseSteamCharts } from "./market-sources";
import type { ChartApp, SteamGame } from "./market-sources";

const NOW = new Date("2026-10-07T16:00:00Z");
const app = (name: string, developer: string, ranks: Record<string, number>, releasedOn: string): ChartApp => ({ id: name, name, developer, url: `https://apps.example/${name}`, ranks, releasedOn, sellerUrl: null });
const steam = (name: string, developer: string, players: number, playersThen: number | null): SteamGame => ({ appid: 1, name, developer, publisher: "Pub", players, playersThen });

describe("groupGameStudios", () => {
  it("groups titles under the studio that made them", () => {
    const studios = groupGameStudios({
      now: NOW,
      apps: [
        app("Bus Traffic Fever!", "GOODROID,Inc.", { "Top free · games": 15, "Top grossing · games": 32 }, "2026-03-13"),
        app("CubeAway", "GOODROID,Inc.", { "Top free · games": 5 }, "2026-03-13"),
        app("Block Out!", "Grand Games A.Ş.", { "Top free · games": 2 }, "2025-10-31"),
      ],
      steam: [],
    });
    expect(studios[0].name).toBe("GOODROID,Inc.");
    expect(studios[0].titles.map((t) => t.name)).toEqual(["Bus Traffic Fever!", "CubeAway"]);
    expect(studios[0].titles[0].signal).toBe("#32 grossing, out Mar 13");
  });

  it("ignores non-game apps and games over a year old", () => {
    const studios = groupGameStudios({
      now: NOW,
      apps: [app("Muse", "Meta Platforms, Inc.", { "Top free · apps": 1 }, "2026-09-08"), app("Old", "Old Studio", { "Top free · games": 1 }, "2019-01-01")],
      steam: [],
    });
    expect(studios).toEqual([]);
  });

  it("adds PC games whose player counts grew, and skips small or shrinking ones", () => {
    const studios = groupGameStudios({
      now: NOW,
      apps: [],
      steam: [steam("Valheim", "Iron Gate AB", 129_713, 17_900), steam("Tiny", "Indie", 900, 300), steam("Palworld", "Pocketpair", 10_000, 63_000), steam("New", "Fresh", 5_000, null)],
    });
    expect(studios.map((s) => s.name)).toEqual(["Iron Gate AB"]);
    expect(studios[0].titles[0]).toMatchObject({ platform: "PC", signal: "players +625% in 3 months" });
  });

  it("merges a studio's mobile and PC titles", () => {
    const studios = groupGameStudios({
      now: NOW,
      apps: [app("Mobile Hit", "Acme Games Inc.", { "Top grossing · games": 20 }, "2026-05-01")],
      steam: [steam("PC Hit", "Acme Games", 50_000, 20_000)],
    });
    expect(studios).toHaveLength(1);
    expect(studios[0].titles.map((t) => t.platform).sort()).toEqual(["Mobile", "PC"]);
  });
});

it("keeps PC studios on the list even when mobile outscores them", () => {
  const apps = Array.from({ length: 15 }, (_, i) => app(`Hit ${i}`, `Mobile Studio ${i}`, { "Top grossing · games": i + 1 }, "2026-06-01"));
  const studios = groupGameStudios({ now: NOW, apps, steam: [steam("Valheim", "Iron Gate AB", 129_713, 17_900)], limit: 10 });
  expect(studios).toHaveLength(10);
  expect(studios.map((s) => s.name)).toContain("Iron Gate AB");
});

describe("parseSteamCharts", () => {
  it("reads monthly averages newest first", () => {
    const html = `<tr class="odd"><td class="month-cell left italic">Last 30 Days</td>
      <td class="right num-f italic">804926.21</td></tr>
      <tr><td class="month-cell left">
        September 2026 </td>
      <td class="right num-f">7962.19</td></tr>`;
    expect(parseSteamCharts(html)).toEqual([["Last 30 Days", 804926.21], ["September 2026", 7962.19]]);
  });
});
