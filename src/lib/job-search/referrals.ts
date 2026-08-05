import { normalizeCompany } from "./application-guard";

/**
 * Which companies Jon already knows somebody at.
 *
 * A referral is the highest-conversion channel in the funnel and the easiest
 * one to forget, because the contact list and the pipeline were separate pages.
 * Anthropic is the case that motivated this: eight open roles, five contacts,
 * every one of them never approached.
 *
 * Matching goes through `normalizeCompany` so the contact list's spelling does
 * not have to agree with the job board's.
 */

export interface ConnectionLike {
  id: string;
  name: string;
  company_name: string | null;
  linkedin_url?: string | null;
  last_contact?: string | null;
}

export interface Contact {
  id: string;
  name: string;
  /** Their profile when known, otherwise a LinkedIn search for them. */
  url: string;
  /** False when the URL is a search rather than a profile. */
  isProfile: boolean;
  contacted: boolean;
}

/**
 * A name search, used when a contact has no profile URL on file.
 *
 * Deliberately not a fabricated profile URL: guessing linkedin.com/in/<slug>
 * produces a dead link most of the time, and a dead link on a referral prompt
 * is worse than an honest search. Zynga's three contacts are all in this state.
 */
export function linkedinSearchUrl(name: string, company: string): string {
  const q = encodeURIComponent(`${name} ${company}`.trim());
  return `https://www.linkedin.com/search/results/people/?keywords=${q}`;
}

export function buildContactIndex(
  connections: ConnectionLike[]
): Map<string, Contact[]> {
  const index = new Map<string, Contact[]>();

  for (const c of connections) {
    if (!c.company_name) continue;
    const key = normalizeCompany(c.company_name);
    if (!key) continue;

    const profile = c.linkedin_url?.trim();
    const contact: Contact = {
      id: c.id,
      name: c.name,
      url: profile || linkedinSearchUrl(c.name, c.company_name),
      isProfile: Boolean(profile),
      contacted: Boolean(c.last_contact),
    };

    const list = index.get(key);
    if (list) list.push(contact);
    else index.set(key, [contact]);
  }

  // Never-contacted first: those are the ones worth a message today.
  for (const list of index.values()) {
    list.sort((a, b) => Number(a.contacted) - Number(b.contacted));
  }

  return index;
}
