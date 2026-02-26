export const styleThemes = [
  {
    id: "midnight",
    name: "Midnight",
    description: "Cool indigo & violet",
    swatches: ["#6366f1", "#8b5cf6", "#a855f7"],
  },
  {
    id: "executive",
    name: "Executive",
    description: "Warm gold & serif type",
    swatches: ["#f59e0b", "#d97706", "#b45309"],
  },
  {
    id: "coastal",
    name: "Coastal",
    description: "Fresh teal & modern",
    swatches: ["#14b8a6", "#0891b2", "#0284c7"],
  },
  {
    id: "rose",
    name: "Rose",
    description: "Elegant rose & classic",
    swatches: ["#f43f5e", "#db2777", "#c026d3"],
  },
] as const;

export type StyleThemeId = (typeof styleThemes)[number]["id"];
