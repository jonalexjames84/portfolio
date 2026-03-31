"use client";

import { useState } from "react";
import { Linkedin, Clock, UserCheck, UserPlus, ChevronDown, ChevronRight } from "lucide-react";

type Connection = {
  id: string;
  name: string;
  company_id: string | null;
  company_name: string | null;
  linkedin_url: string | null;
  linkedin_connected: boolean;
  met_in_person: boolean;
  meeting_notes: string | null;
  referral_status: string;
  referral_role: string | null;
  last_contact: string | null;
  next_action: string | null;
  updated_at: string;
};

const referralStyles: Record<string, string> = {
  none: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  requested: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  received: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  strong: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

function groupByCompany(connections: Connection[]): Record<string, Connection[]> {
  const groups: Record<string, Connection[]> = {};
  for (const c of connections) {
    const key = c.company_name || "Other";
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  }
  return groups;
}

function needsFollowUp(c: Connection): boolean {
  if (!c.last_contact || !c.next_action) return false;
  const lastContact = new Date(c.last_contact);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return lastContact < sevenDaysAgo;
}

export function ConnectionsList({ connections: initial }: { connections: Connection[] }) {
  const [connections, setConnections] = useState(initial);
  const [filter, setFilter] = useState<string>("all");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Connection>>({});

  const filtered = connections.filter((c) => {
    if (filter === "needs_followup") return needsFollowUp(c);
    if (filter === "has_referral") return c.referral_status !== "none";
    return true;
  });

  const grouped = groupByCompany(filtered);
  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  const followUpCount = connections.filter(needsFollowUp).length;

  function toggleGroup(name: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/job-search/connections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editValues),
    });
    if (res.ok) {
      const updated = await res.json();
      setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    }
    setEditingId(null);
    setEditValues({});
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "all", label: `All (${connections.length})` },
          { key: "needs_followup", label: `Needs Follow-up (${followUpCount})` },
          { key: "has_referral", label: "Has Referral" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              filter === f.key
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grouped connections */}
      <div className="space-y-4">
        {sortedGroups.map(([companyName, contacts]) => {
          const collapsed = collapsedGroups.has(companyName);
          return (
            <div key={companyName} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleGroup(companyName)}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                {collapsed ? <ChevronRight className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{companyName}</span>
                <span className="text-xs text-zinc-400">{contacts.length}</span>
              </button>
              {!collapsed && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="px-4 py-3">
                      {editingId === contact.id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] font-medium text-zinc-400 uppercase">Referral Status</label>
                              <select
                                value={editValues.referral_status ?? contact.referral_status}
                                onChange={(e) => setEditValues({ ...editValues, referral_status: e.target.value })}
                                className="w-full mt-1 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5"
                              >
                                <option value="none">None</option>
                                <option value="requested">Requested</option>
                                <option value="received">Received</option>
                                <option value="strong">Strong</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[11px] font-medium text-zinc-400 uppercase">Last Contact</label>
                              <input
                                type="date"
                                value={editValues.last_contact ?? contact.last_contact ?? ""}
                                onChange={(e) => setEditValues({ ...editValues, last_contact: e.target.value })}
                                className="w-full mt-1 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] font-medium text-zinc-400 uppercase">Next Action</label>
                            <input
                              type="text"
                              value={editValues.next_action ?? contact.next_action ?? ""}
                              onChange={(e) => setEditValues({ ...editValues, next_action: e.target.value })}
                              className="w-full mt-1 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(contact.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600">Save</button>
                            <button onClick={() => { setEditingId(null); setEditValues({}); }} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{contact.name}</span>
                              {contact.linkedin_connected && <Linkedin className="h-3.5 w-3.5 text-blue-500" />}
                              {contact.met_in_person && <UserCheck className="h-3.5 w-3.5 text-emerald-500" />}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${referralStyles[contact.referral_status]}`}>
                                {contact.referral_status}
                              </span>
                              {contact.last_contact && (
                                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(contact.last_contact + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                              )}
                              {needsFollowUp(contact) && (
                                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">needs follow-up</span>
                              )}
                            </div>
                            {contact.next_action && (
                              <p className="text-xs text-zinc-500 mt-1">Next: {contact.next_action}</p>
                            )}
                          </div>
                          <button
                            onClick={() => { setEditingId(contact.id); setEditValues({}); }}
                            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-lg font-medium">No connections yet</p>
          <p className="text-sm mt-1">Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">/connection-request</code> in Claude Code</p>
        </div>
      )}
    </div>
  );
}
