"use client";

import { useState } from "react";
import { Calendar, MessageSquare, ChevronDown, ChevronRight, X } from "lucide-react";

type Interview = {
  id: string;
  company: string;
  role: string;
  round: number;
  date: string;
  interviewer: string | null;
  format: string | null;
  questions: { question: string; score: number; type: string }[];
  overall: string | null;
  signals: string | null;
  key_improvement: string | null;
  next_round_prediction: string | null;
  prep_package: string | null;
  created_at: string;
};

const overallStyles: Record<string, string> = {
  strong: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  adequate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  weak: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function InterviewList({ upcoming, past }: { upcoming: Interview[]; past: Interview[] }) {
  const [tab, setTab] = useState<"upcoming" | "history">(upcoming.length > 0 ? "upcoming" : "history");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewingPrep, setViewingPrep] = useState<string | null>(null);

  const interviews = tab === "upcoming" ? upcoming : past;
  const prepViewing = interviews.find((i) => i.id === viewingPrep);

  return (
    <div>
      <div className="flex gap-1 mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
        <button
          onClick={() => setTab("upcoming")}
          className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
            tab === "upcoming" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
            tab === "history" ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          History ({past.length})
        </button>
      </div>

      <div className="space-y-2">
        {interviews.map((interview) => {
          const isExpanded = expandedId === interview.id;
          return (
            <div
              key={interview.id}
              className={`rounded-xl border overflow-hidden transition-all ${
                isExpanded
                  ? "border-accent-500 dark:border-accent-600 shadow-md"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              }`}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                onClick={() => setExpandedId(isExpanded ? null : interview.id)}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{interview.company}</span>
                    <span className="text-xs text-zinc-400">Round {interview.round}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{interview.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  {interview.format && (
                    <span className="text-[11px] text-zinc-400">{interview.format}</span>
                  )}
                  {interview.overall && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${overallStyles[interview.overall]}`}>
                      {interview.overall}
                    </span>
                  )}
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(interview.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
                  {interview.interviewer && (
                    <div className="text-sm"><span className="text-zinc-400">Interviewer:</span> <span className="text-zinc-700 dark:text-zinc-300">{interview.interviewer}</span></div>
                  )}

                  {interview.questions.length > 0 && (
                    <div>
                      <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-2">Questions</div>
                      <div className="space-y-2">
                        {interview.questions.map((q, i) => (
                          <div key={i} className="flex items-start justify-between bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-200 dark:border-zinc-700">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-zinc-700 dark:text-zinc-300">{q.question}</p>
                              <p className="text-[11px] text-zinc-400 mt-0.5">{q.type}</p>
                            </div>
                            <span className={`text-sm font-bold ml-3 ${q.score >= 7 ? "text-emerald-600" : q.score >= 5 ? "text-amber-600" : "text-red-600"}`}>
                              {q.score}/10
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {interview.signals && (
                    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                      <div className="text-[11px] font-medium text-zinc-400 uppercase mb-1">Signals</div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">{interview.signals}</p>
                    </div>
                  )}

                  {interview.key_improvement && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <div className="text-[11px] font-medium text-amber-600 uppercase mb-1">Key Improvement</div>
                      <p className="text-sm text-amber-700 dark:text-amber-300">{interview.key_improvement}</p>
                    </div>
                  )}

                  {interview.prep_package && (
                    <button
                      onClick={() => setViewingPrep(interview.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> View Prep Package
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {interviews.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-lg font-medium">No {tab === "upcoming" ? "upcoming" : "past"} interviews</p>
          <p className="text-sm mt-1">Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">/interview-prep</code> in Claude Code</p>
        </div>
      )}

      {prepViewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewingPrep(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{prepViewing.company} — Round {prepViewing.round} Prep</span>
              <button onClick={() => setViewingPrep(null)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X className="h-4 w-4 text-zinc-400" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[calc(80vh-64px)]">
              <pre className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">{prepViewing.prep_package}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
