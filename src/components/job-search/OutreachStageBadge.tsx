"use client";

const stages = [
  "identified",
  "contacted",
  "followed_up",
  "responded",
  "referral_requested",
  "referral_received",
] as const;

export type OutreachStage = (typeof stages)[number];

const stageStyles: Record<OutreachStage, string> = {
  identified: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  contacted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  followed_up: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  responded: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  referral_requested: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  referral_received: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const stageLabels: Record<OutreachStage, string> = {
  identified: "Identified",
  contacted: "Contacted",
  followed_up: "Followed Up",
  responded: "Responded",
  referral_requested: "Referral Requested",
  referral_received: "Referral Received",
};

export function OutreachStageBadge({
  stage,
  editable = false,
  onChange,
}: {
  stage: string;
  editable?: boolean;
  onChange?: (stage: OutreachStage) => void;
}) {
  const validStage = (stages.includes(stage as OutreachStage) ? stage : "identified") as OutreachStage;

  if (editable && onChange) {
    return (
      <select
        value={validStage}
        onChange={(e) => onChange(e.target.value as OutreachStage)}
        className={`appearance-none text-[11px] font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${stageStyles[validStage]}`}
      >
        {stages.map((s) => (
          <option key={s} value={s}>
            {stageLabels[s]}
          </option>
        ))}
      </select>
    );
  }

  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${stageStyles[validStage]}`}>
      {stageLabels[validStage]}
    </span>
  );
}
