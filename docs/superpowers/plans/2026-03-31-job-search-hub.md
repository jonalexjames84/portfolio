# Job Search Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private, password-gated Job Search Hub at `/job-search` with 5 sections: target companies, network/connections, materials library, interview prep/history, and company intel.

**Architecture:** Next.js app router with nested routes under `/job-search`. 4 new Supabase tables (`job_target_companies`, `job_connections`, `job_materials`, `job_interviews`) following existing `job_` prefix pattern. Server components for data fetching, client components for interactivity. Auth extends existing cookie-based middleware gate.

**Tech Stack:** Next.js 16, React 19, Supabase, TypeScript, Tailwind CSS 4, Framer Motion, Lucide React

---

## File Structure

```
src/
├── middleware.ts                                    # MODIFY — add /job-search/* to auth gate
├── app/
│   └── job-search/
│       ├── layout.tsx                               # CREATE — shared layout with tab nav
│       ├── page.tsx                                  # CREATE — overview/landing
│       ├── companies/
│       │   └── page.tsx                              # CREATE — target companies list
│       ├── network/
│       │   └── page.tsx                              # CREATE — connections CRM
│       ├── materials/
│       │   └── page.tsx                              # CREATE — materials library
│       ├── interviews/
│       │   └── page.tsx                              # CREATE — interview prep & history
│       └── intel/
│           └── [slug]/
│               └── page.tsx                          # CREATE — company intel profile
├── app/api/job-search/
│   ├── companies/
│   │   ├── route.ts                                  # CREATE — GET/POST for companies
│   │   └── [id]/
│   │       └── route.ts                              # CREATE — PATCH/DELETE for company
│   ├── connections/
│   │   ├── route.ts                                  # CREATE — GET/POST for connections
│   │   └── [id]/
│   │       └── route.ts                              # CREATE — PATCH/DELETE for connection
│   ├── materials/
│   │   ├── route.ts                                  # CREATE — GET/POST for materials
│   │   └── [id]/
│   │       └── route.ts                              # CREATE — DELETE for material
│   ├── interviews/
│   │   ├── route.ts                                  # CREATE — GET/POST for interviews
│   │   └── [id]/
│   │       └── route.ts                              # CREATE — PATCH/DELETE for interview
│   └── intel/
│       └── [slug]/
│           └── route.ts                              # CREATE — GET for company intel
└── components/job-search/
    ├── HubNav.tsx                                    # CREATE — tab navigation component
    ├── CompaniesTable.tsx                             # CREATE — sortable, filterable table
    ├── CompanyDetail.tsx                              # CREATE — inline expand detail
    ├── ConnectionsList.tsx                            # CREATE — grouped contacts CRM
    ├── ConnectionCard.tsx                             # CREATE — individual contact card
    ├── MaterialsGrid.tsx                              # CREATE — card grid with filters
    ├── MaterialViewer.tsx                             # CREATE — full content modal/view
    ├── InterviewList.tsx                              # CREATE — upcoming + history tabs
    └── IntelProfile.tsx                               # CREATE — markdown rendered profile
```

---

### Task 1: Database Schema — Create 4 Supabase Tables

**Files:**
- No local files — Supabase SQL via MCP tool

- [ ] **Step 1: Create job_target_companies table**

```sql
CREATE TABLE job_target_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rank integer,
  name text NOT NULL,
  stage text,
  industry text,
  product_focus text,
  hiring_status text DEFAULT 'unknown',
  recent_news text,
  connections_count integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_job_target_companies_rank ON job_target_companies(rank);
CREATE INDEX idx_job_target_companies_hiring ON job_target_companies(hiring_status);
```

- [ ] **Step 2: Create job_connections table**

```sql
CREATE TABLE job_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_id uuid REFERENCES job_target_companies(id) ON DELETE SET NULL,
  company_name text,
  linkedin_url text,
  linkedin_connected boolean DEFAULT false,
  met_in_person boolean DEFAULT false,
  meeting_notes text,
  referral_status text DEFAULT 'none',
  referral_role text,
  last_contact date,
  next_action text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_job_connections_company ON job_connections(company_id);
CREATE INDEX idx_job_connections_referral ON job_connections(referral_status);
```

- [ ] **Step 3: Create job_materials table**

```sql
CREATE TABLE job_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  role text NOT NULL,
  type text NOT NULL,
  content text NOT NULL,
  jd_text text,
  coverage_score integer,
  gaps text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_job_materials_company ON job_materials(company);
CREATE INDEX idx_job_materials_type ON job_materials(type);
```

- [ ] **Step 4: Create job_interviews table**

```sql
CREATE TABLE job_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  role text NOT NULL,
  round integer DEFAULT 1,
  date date NOT NULL,
  interviewer text,
  format text,
  questions jsonb DEFAULT '[]'::jsonb,
  overall text,
  signals text,
  key_improvement text,
  next_round_prediction text,
  prep_package text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_job_interviews_company ON job_interviews(company);
CREATE INDEX idx_job_interviews_date ON job_interviews(date);
```

- [ ] **Step 5: Verify all tables exist**

Run a quick SELECT against each table to confirm they were created:

```sql
SELECT count(*) FROM job_target_companies;
SELECT count(*) FROM job_connections;
SELECT count(*) FROM job_materials;
SELECT count(*) FROM job_interviews;
```

Expected: All return 0 rows, no errors.

- [ ] **Step 6: Commit**

No local files to commit for this task — tables are in Supabase.

---

### Task 2: Auth Gate — Extend Middleware to Cover /job-search

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Add /job-search/* to the auth check**

In `src/middleware.ts`, update the auth gate condition on line 35 to also cover `/job-search`:

```typescript
  if (
    pathname.startsWith("/dashboard/job-search") ||
    pathname.startsWith("/job-search") ||
    (pathname.startsWith("/api/job-search") && !request.headers.get("authorization"))
  ) {
```

- [ ] **Step 2: Update the redirect target for /job-search routes**

Change the redirect to go to the homepage (already does this — no change needed, just verify the redirect on line 43 sends to `/`).

- [ ] **Step 3: Add /job-search to the middleware matcher**

Update the `config.matcher` array at the bottom of the file:

```typescript
export const config = {
  matcher: ["/api/dashboard/posthog", "/api/resume", "/dashboard/job-search/:path*", "/api/job-search/:path*", "/job-search/:path*"],
};
```

- [ ] **Step 4: Update login route to accept redirect param**

In `src/app/api/auth/login/route.ts`, update to support a `redirect` query param so the login can send users to `/job-search` instead of always `/dashboard/job-search`:

```typescript
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_EMAIL = "jonalexjames@gmail.com";
const AUTH_SECRET = process.env.JOB_SEARCH_AUTH_SECRET || "jon-job-search-2026";
const COOKIE_NAME = "job_search_auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const email = request.nextUrl.searchParams.get("email");
  const redirectTo = request.nextUrl.searchParams.get("redirect") || "/dashboard/job-search";

  if (email !== ALLOWED_EMAIL || token !== AUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set(COOKIE_NAME, AUTH_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
```

- [ ] **Step 5: Verify dev server starts without errors**

Run: `npm run dev`
Expected: No build errors.

- [ ] **Step 6: Commit**

```bash
git add src/middleware.ts src/app/api/auth/login/route.ts
git commit -m "feat: extend auth gate to cover /job-search routes"
```

---

### Task 3: API Routes — Companies CRUD

**Files:**
- Create: `src/app/api/job-search/companies/route.ts`
- Create: `src/app/api/job-search/companies/[id]/route.ts`

- [ ] **Step 1: Create GET/POST route for companies**

Create `src/app/api/job-search/companies/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.JOB_SEARCH_API_KEY}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const industry = searchParams.get("industry");
  const sort = searchParams.get("sort") || "rank";

  let query = supabase.from("job_target_companies").select("*");

  if (status) query = query.eq("hiring_status", status);
  if (industry) query = query.eq("industry", industry);

  const ascending = sort !== "updated_at";
  query = query.order(sort === "updated_at" ? "updated_at" : sort === "name" ? "name" : "rank", {
    ascending,
    nullsFirst: false,
  });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ companies: data || [] });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const rows = Array.isArray(body) ? body : [body];

  const { data, error } = await supabase
    .from("job_target_companies")
    .insert(rows)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ companies: data }, { status: 201 });
}
```

- [ ] **Step 2: Create PATCH/DELETE route for single company**

Create `src/app/api/job-search/companies/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from("job_target_companies")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase
    .from("job_target_companies")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
```

- [ ] **Step 3: Verify routes compile**

Run: `npm run dev`
Expected: No build errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/job-search/companies/
git commit -m "feat: add companies CRUD API routes"
```

---

### Task 4: API Routes — Connections CRUD

**Files:**
- Create: `src/app/api/job-search/connections/route.ts`
- Create: `src/app/api/job-search/connections/[id]/route.ts`

- [ ] **Step 1: Create GET/POST route for connections**

Create `src/app/api/job-search/connections/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.JOB_SEARCH_API_KEY}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const companyId = searchParams.get("company_id");
  const needsFollowup = searchParams.get("needs_followup");

  let query = supabase.from("job_connections").select("*").order("updated_at", { ascending: false });

  if (companyId) query = query.eq("company_id", companyId);
  if (needsFollowup === "true") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query = query.lt("last_contact", sevenDaysAgo.toISOString().split("T")[0]).not("next_action", "is", null);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connections: data || [] });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const rows = Array.isArray(body) ? body : [body];

  const { data, error } = await supabase
    .from("job_connections")
    .insert(rows)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connections: data }, { status: 201 });
}
```

- [ ] **Step 2: Create PATCH/DELETE route for single connection**

Create `src/app/api/job-search/connections/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from("job_connections")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase
    .from("job_connections")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/job-search/connections/
git commit -m "feat: add connections CRUD API routes"
```

---

### Task 5: API Routes — Materials & Interviews & Intel

**Files:**
- Create: `src/app/api/job-search/materials/route.ts`
- Create: `src/app/api/job-search/materials/[id]/route.ts`
- Create: `src/app/api/job-search/interviews/route.ts`
- Create: `src/app/api/job-search/interviews/[id]/route.ts`
- Create: `src/app/api/job-search/intel/[slug]/route.ts`

- [ ] **Step 1: Create materials GET/POST route**

Create `src/app/api/job-search/materials/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.JOB_SEARCH_API_KEY}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const company = searchParams.get("company");
  const type = searchParams.get("type");

  let query = supabase.from("job_materials").select("*").order("created_at", { ascending: false });

  if (company) query = query.eq("company", company);
  if (type) query = query.eq("type", type);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ materials: data || [] });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("job_materials")
    .insert(body)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ materials: data }, { status: 201 });
}
```

- [ ] **Step 2: Create materials DELETE route**

Create `src/app/api/job-search/materials/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase
    .from("job_materials")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
```

- [ ] **Step 3: Create interviews GET/POST route**

Create `src/app/api/job-search/interviews/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.JOB_SEARCH_API_KEY}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const company = searchParams.get("company");
  const upcoming = searchParams.get("upcoming");

  let query = supabase.from("job_interviews").select("*");

  if (company) query = query.eq("company", company);
  if (upcoming === "true") {
    query = query.gte("date", new Date().toISOString().split("T")[0]).order("date", { ascending: true });
  } else {
    query = query.order("date", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ interviews: data || [] });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("job_interviews")
    .insert(body)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ interviews: data }, { status: 201 });
}
```

- [ ] **Step 4: Create interviews PATCH/DELETE route**

Create `src/app/api/job-search/interviews/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from("job_interviews")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase
    .from("job_interviews")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
```

- [ ] **Step 5: Create intel read-only route**

Create `src/app/api/job-search/intel/[slug]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Sanitize slug to prevent path traversal
  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");

  const intelDir = path.join(process.cwd(), "job-search-os", "insider-data", "company-intel");
  const filePath = path.join(intelDir, `${safeSlug}.md`);

  try {
    const content = await readFile(filePath, "utf-8");

    // Extract last updated date from frontmatter or content
    const lastUpdatedMatch = content.match(/Last updated:?\s*(.+)/i);
    const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1].trim() : null;

    // Check staleness (> 6 months)
    let stale = false;
    if (lastUpdated) {
      const updated = new Date(lastUpdated);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      stale = updated < sixMonthsAgo;
    }

    return NextResponse.json({ slug: safeSlug, content, lastUpdated, stale });
  } catch {
    return NextResponse.json({ error: "Company intel not found" }, { status: 404 });
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/job-search/materials/ src/app/api/job-search/interviews/ src/app/api/job-search/intel/
git commit -m "feat: add materials, interviews, and intel API routes"
```

---

### Task 6: Hub Layout & Navigation

**Files:**
- Create: `src/components/job-search/HubNav.tsx`
- Create: `src/app/job-search/layout.tsx`

- [ ] **Step 1: Create the tab navigation component**

Create `src/components/job-search/HubNav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users, FileText, MessageSquare, Search } from "lucide-react";

const tabs = [
  { href: "/job-search", label: "Overview", icon: Search, exact: true },
  { href: "/job-search/companies", label: "Companies", icon: Building2 },
  { href: "/job-search/network", label: "Network", icon: Users },
  { href: "/job-search/materials", label: "Materials", icon: FileText },
  { href: "/job-search/interviews", label: "Interviews", icon: MessageSquare },
];

export function HubNav() {
  const pathname = usePathname();

  function isActive(tab: (typeof tabs)[number]) {
    if (tab.exact) return pathname === tab.href;
    return pathname.startsWith(tab.href);
  }

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
      {tabs.map((tab) => {
        const active = isActive(tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-accent-50 text-accent-700 dark:bg-accent-950/40 dark:text-accent-400"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Create the hub layout**

Create `src/app/job-search/layout.tsx`:

```tsx
import { HubNav } from "@/components/job-search/HubNav";

export const metadata = {
  title: "Job Search Hub",
};

export default function JobSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Job Search Hub
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Your operating system for landing the next role
        </p>
      </div>
      <div className="mb-6">
        <HubNav />
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Verify layout renders**

Run: `npm run dev`
Navigate to `/job-search` (after auth). Expected: layout renders with tab nav, 404 for the page itself (not yet created).

- [ ] **Step 4: Commit**

```bash
git add src/components/job-search/HubNav.tsx src/app/job-search/layout.tsx
git commit -m "feat: add job search hub layout with tab navigation"
```

---

### Task 7: Overview Page

**Files:**
- Create: `src/app/job-search/page.tsx`

- [ ] **Step 1: Create the overview page**

Create `src/app/job-search/page.tsx`:

```tsx
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Building2, Users, FileText, MessageSquare } from "lucide-react";

async function getStats() {
  const [companies, connections, materials, interviews] = await Promise.all([
    supabase.from("job_target_companies").select("id", { count: "exact", head: true }),
    supabase.from("job_connections").select("id", { count: "exact", head: true }),
    supabase.from("job_materials").select("id", { count: "exact", head: true }),
    supabase.from("job_interviews").select("id", { count: "exact", head: true }).gte("date", new Date().toISOString().split("T")[0]),
  ]);

  return {
    companies: companies.count || 0,
    connections: connections.count || 0,
    materials: materials.count || 0,
    upcomingInterviews: interviews.count || 0,
  };
}

export default async function JobSearchOverview() {
  const stats = await getStats();

  const cards = [
    { label: "Target Companies", value: stats.companies, href: "/job-search/companies", icon: Building2, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Connections", value: stats.connections, href: "/job-search/network", icon: Users, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Materials", value: stats.materials, href: "/job-search/materials", icon: FileText, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
    { label: "Upcoming Interviews", value: stats.upcomingInterviews, href: "/job-search/interviews", icon: MessageSquare, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
        >
          <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${card.bg} mb-3`}>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{card.label}</div>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify the overview page renders**

Run: `npm run dev`
Navigate to `/job-search`. Expected: 4 stat cards showing 0 for each, clickable links to sub-pages.

- [ ] **Step 3: Commit**

```bash
git add src/app/job-search/page.tsx
git commit -m "feat: add job search hub overview page with stats"
```

---

### Task 8: Target Companies Page

**Files:**
- Create: `src/components/job-search/CompaniesTable.tsx`
- Create: `src/app/job-search/companies/page.tsx`

- [ ] **Step 1: Create the companies table component**

Create `src/components/job-search/CompaniesTable.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Pencil, Check, X } from "lucide-react";

type Company = {
  id: string;
  rank: number | null;
  name: string;
  stage: string | null;
  industry: string | null;
  product_focus: string | null;
  hiring_status: string | null;
  recent_news: string | null;
  connections_count: number;
  notes: string | null;
  updated_at: string;
};

const hiringStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  unknown: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  frozen: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function CompaniesTable({ companies: initial }: { companies: Company[] }) {
  const [companies, setCompanies] = useState(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Company>>({});
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rank");

  const filtered = companies.filter((c) => {
    if (filter === "all") return true;
    return c.hiring_status === filter;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
    if (sortBy === "updated_at") return (b.updated_at || "").localeCompare(a.updated_at || "");
    return (a.rank || 999) - (b.rank || 999);
  });

  async function saveEdit(id: string) {
    const res = await fetch(`/api/job-search/companies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editValues),
    });
    if (res.ok) {
      const updated = await res.json();
      setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    }
    setEditingId(null);
    setEditValues({});
  }

  return (
    <div>
      {/* Filters and sort */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {["all", "active", "unknown", "frozen"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                filter === f
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-xs bg-zinc-100 dark:bg-zinc-800 border-0 rounded-lg px-3 py-1.5 text-zinc-600 dark:text-zinc-400"
        >
          <option value="rank">Sort by Rank</option>
          <option value="name">Sort by Name</option>
          <option value="updated_at">Last Updated</option>
        </select>
      </div>

      {/* Table */}
      <div className="space-y-2">
        {sorted.map((company) => {
          const isExpanded = expandedId === company.id;
          const isEditing = editingId === company.id;

          return (
            <div
              key={company.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isExpanded
                  ? "border-accent-500 dark:border-accent-600 shadow-md"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              }`}
            >
              {/* Row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                onClick={() => setExpandedId(isExpanded ? null : company.id)}
              >
                <span className="text-xs font-mono text-zinc-400 w-6 text-right shrink-0">
                  {company.rank || "—"}
                </span>
                <div className="shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {company.name}
                  </span>
                  {company.stage && (
                    <span className="text-xs text-zinc-400 ml-2">{company.stage}</span>
                  )}
                </div>
                {company.industry && (
                  <span className="hidden sm:inline text-xs text-zinc-400">{company.industry}</span>
                )}
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${hiringStyles[company.hiring_status || "unknown"]}`}>
                  {company.hiring_status || "unknown"}
                </span>
                {company.connections_count > 0 && (
                  <span className="text-xs text-zinc-400">{company.connections_count} conn</span>
                )}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Rank</label>
                          <input
                            type="number"
                            value={editValues.rank ?? company.rank ?? ""}
                            onChange={(e) => setEditValues({ ...editValues, rank: parseInt(e.target.value) || null })}
                            className="w-full mt-1 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Hiring Status</label>
                          <select
                            value={editValues.hiring_status ?? company.hiring_status ?? "unknown"}
                            onChange={(e) => setEditValues({ ...editValues, hiring_status: e.target.value })}
                            className="w-full mt-1 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5"
                          >
                            <option value="active">Active</option>
                            <option value="unknown">Unknown</option>
                            <option value="frozen">Frozen</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Notes</label>
                        <textarea
                          value={editValues.notes ?? company.notes ?? ""}
                          onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                          rows={3}
                          className="w-full mt-1 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(company.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500 text-white hover:bg-teal-600">
                          <Check className="h-3.5 w-3.5" /> Save
                        </button>
                        <button onClick={() => { setEditingId(null); setEditValues({}); }} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          <X className="h-3.5 w-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {company.product_focus && (
                        <div>
                          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-1">Product Focus</div>
                          <div className="text-sm text-zinc-700 dark:text-zinc-300">{company.product_focus}</div>
                        </div>
                      )}
                      {company.recent_news && (
                        <div>
                          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-1">Recent News</div>
                          <div className="text-sm text-zinc-700 dark:text-zinc-300">{company.recent_news}</div>
                        </div>
                      )}
                      {company.notes && (
                        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-1">Notes</div>
                          <div className="text-sm text-zinc-700 dark:text-zinc-300">{company.notes}</div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingId(company.id); setEditValues({}); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <a
                          href={`/job-search/intel/${company.name.toLowerCase().replace(/\s+/g, "-")}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Intel
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <p className="text-lg font-medium">No target companies yet</p>
          <p className="text-sm mt-1">Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">/company-research generate target list</code> in Claude Code</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create the companies page**

Create `src/app/job-search/companies/page.tsx`:

```tsx
import { supabase } from "@/lib/supabase";
import { CompaniesTable } from "@/components/job-search/CompaniesTable";

export const metadata = { title: "Target Companies" };

export default async function CompaniesPage() {
  const { data } = await supabase
    .from("job_target_companies")
    .select("*")
    .order("rank", { ascending: true, nullsFirst: false });

  return <CompaniesTable companies={data || []} />;
}
```

- [ ] **Step 3: Verify companies page renders**

Run: `npm run dev`
Navigate to `/job-search/companies`. Expected: empty state message with instructions.

- [ ] **Step 4: Commit**

```bash
git add src/components/job-search/CompaniesTable.tsx src/app/job-search/companies/
git commit -m "feat: add target companies page with sortable, filterable table"
```

---

### Task 9: Network / Connections Page

**Files:**
- Create: `src/components/job-search/ConnectionsList.tsx`
- Create: `src/app/job-search/network/page.tsx`

- [ ] **Step 1: Create the connections list component**

Create `src/components/job-search/ConnectionsList.tsx`:

```tsx
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
```

- [ ] **Step 2: Create the network page**

Create `src/app/job-search/network/page.tsx`:

```tsx
import { supabase } from "@/lib/supabase";
import { ConnectionsList } from "@/components/job-search/ConnectionsList";

export const metadata = { title: "Network" };

export default async function NetworkPage() {
  const { data } = await supabase
    .from("job_connections")
    .select("*")
    .order("updated_at", { ascending: false });

  return <ConnectionsList connections={data || []} />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/job-search/ConnectionsList.tsx src/app/job-search/network/
git commit -m "feat: add network/connections CRM page"
```

---

### Task 10: Materials Library Page

**Files:**
- Create: `src/components/job-search/MaterialsGrid.tsx`
- Create: `src/app/job-search/materials/page.tsx`

- [ ] **Step 1: Create the materials grid component**

Create `src/components/job-search/MaterialsGrid.tsx`:

```tsx
"use client";

import { useState } from "react";
import { FileText, Copy, X, Check } from "lucide-react";

type Material = {
  id: string;
  company: string;
  role: string;
  type: string;
  content: string;
  jd_text: string | null;
  coverage_score: number | null;
  gaps: string | null;
  created_at: string;
};

const typeStyles: Record<string, { label: string; color: string }> = {
  resume: { label: "Resume", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  cover_letter: { label: "Cover Letter", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  work_product: { label: "Work Product", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

export function MaterialsGrid({ materials: initial }: { materials: Material[] }) {
  const [materials] = useState(initial);
  const [filter, setFilter] = useState<string>("all");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = materials.filter((m) => {
    if (filter === "all") return true;
    return m.type === filter;
  });

  // Group by company
  const grouped: Record<string, Material[]> = {};
  for (const m of filtered) {
    if (!grouped[m.company]) grouped[m.company] = [];
    grouped[m.company].push(m);
  }

  const viewing = materials.find((m) => m.id === viewingId);

  async function copyContent(content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "all", label: "All" },
          { key: "resume", label: "Resumes" },
          { key: "cover_letter", label: "Cover Letters" },
          { key: "work_product", label: "Work Products" },
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

      {/* Cards grouped by company */}
      <div className="space-y-6">
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([company, items]) => (
          <div key={company}>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{company}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((material) => {
                const typeInfo = typeStyles[material.type] || typeStyles.resume;
                return (
                  <button
                    key={material.id}
                    onClick={() => setViewingId(material.id)}
                    className="text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {material.coverage_score !== null && (
                        <span className="text-xs font-mono text-zinc-400">{material.coverage_score}%</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">{material.role}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {new Date(material.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-lg font-medium">No materials yet</p>
          <p className="text-sm mt-1">Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">/resume-tailor</code> or <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">/cover-letter</code> in Claude Code</p>
        </div>
      )}

      {/* Full content viewer modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewingId(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeStyles[viewing.type]?.color}`}>
                    {typeStyles[viewing.type]?.label}
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{viewing.company} — {viewing.role}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyContent(viewing.content)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button onClick={() => setViewingId(null)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              </div>
            </div>
            <div className="p-5 overflow-y-auto max-h-[calc(80vh-64px)]">
              <pre className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">{viewing.content}</pre>
              {viewing.gaps && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="text-[11px] font-medium text-amber-600 uppercase tracking-wide mb-1">Gaps</div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">{viewing.gaps}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create the materials page**

Create `src/app/job-search/materials/page.tsx`:

```tsx
import { supabase } from "@/lib/supabase";
import { MaterialsGrid } from "@/components/job-search/MaterialsGrid";

export const metadata = { title: "Materials" };

export default async function MaterialsPage() {
  const { data } = await supabase
    .from("job_materials")
    .select("*")
    .order("created_at", { ascending: false });

  return <MaterialsGrid materials={data || []} />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/job-search/MaterialsGrid.tsx src/app/job-search/materials/
git commit -m "feat: add materials library page with content viewer"
```

---

### Task 11: Interview Prep & History Page

**Files:**
- Create: `src/components/job-search/InterviewList.tsx`
- Create: `src/app/job-search/interviews/page.tsx`

- [ ] **Step 1: Create the interview list component**

Create `src/components/job-search/InterviewList.tsx`:

```tsx
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
      {/* Tabs */}
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

      {/* Interview list */}
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

      {/* Prep package modal */}
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
```

- [ ] **Step 2: Create the interviews page**

Create `src/app/job-search/interviews/page.tsx`:

```tsx
import { supabase } from "@/lib/supabase";
import { InterviewList } from "@/components/job-search/InterviewList";

export const metadata = { title: "Interviews" };

export default async function InterviewsPage() {
  const today = new Date().toISOString().split("T")[0];

  const [upcomingRes, pastRes] = await Promise.all([
    supabase.from("job_interviews").select("*").gte("date", today).order("date", { ascending: true }),
    supabase.from("job_interviews").select("*").lt("date", today).order("date", { ascending: false }),
  ]);

  return (
    <InterviewList
      upcoming={upcomingRes.data || []}
      past={pastRes.data || []}
    />
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/job-search/InterviewList.tsx src/app/job-search/interviews/
git commit -m "feat: add interview prep and history page"
```

---

### Task 12: Company Intel Page

**Files:**
- Create: `src/app/job-search/intel/[slug]/page.tsx`

- [ ] **Step 1: Create the intel detail page**

Create `src/app/job-search/intel/[slug]/page.tsx`:

```tsx
import { readFile, readdir } from "fs/promises";
import path from "path";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

async function getIntel(slug: string) {
  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");
  const intelDir = path.join(process.cwd(), "job-search-os", "insider-data", "company-intel");
  const filePath = path.join(intelDir, `${safeSlug}.md`);

  try {
    const content = await readFile(filePath, "utf-8");
    const lastUpdatedMatch = content.match(/Last updated:?\s*(.+)/i);
    const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1].trim() : null;

    let stale = false;
    if (lastUpdated) {
      const updated = new Date(lastUpdated);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      stale = updated < sixMonthsAgo;
    }

    return { content, lastUpdated, stale, found: true };
  } catch {
    return { content: "", lastUpdated: null, stale: false, found: false };
  }
}

export async function generateStaticParams() {
  const intelDir = path.join(process.cwd(), "job-search-os", "insider-data", "company-intel");
  try {
    const files = await readdir(intelDir);
    return files
      .filter((f) => f.endsWith(".md") && f !== "index.md")
      .map((f) => ({ slug: f.replace(".md", "") }));
  } catch {
    return [];
  }
}

export default async function IntelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const intel = await getIntel(slug);

  if (!intel.found) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium text-zinc-400">No intel found for &quot;{slug}&quot;</p>
        <Link href="/job-search/companies" className="text-sm text-accent-600 hover:text-accent-700 mt-2 inline-block">
          Back to companies
        </Link>
      </div>
    );
  }

  // Simple markdown-to-sections parser: split on ## headers
  const sections = intel.content.split(/^## /m).filter(Boolean).map((section) => {
    const lines = section.split("\n");
    const title = lines[0].trim();
    const body = lines.slice(1).join("\n").trim();
    return { title, body };
  });

  return (
    <div>
      <Link
        href="/job-search/companies"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to companies
      </Link>

      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
        {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
      </h2>

      {intel.lastUpdated && (
        <p className="text-xs text-zinc-400 mb-4">Last updated: {intel.lastUpdated}</p>
      )}

      {intel.stale && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            This intel may be outdated. Run <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">/company-research {slug.replace(/-/g, " ")}</code> for fresh data.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">{section.title}</h3>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {section.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/job-search/intel/
git commit -m "feat: add company intel detail page with staleness warnings"
```

---

### Task 13: Build Verification & Final Polish

**Files:**
- Modify: `src/middleware.ts` (already done in Task 2, verify)

- [ ] **Step 1: Run the build**

Run: `npm run build`
Expected: Build completes with no errors. Some pages may show warnings about dynamic server usage (expected for Supabase queries).

- [ ] **Step 2: Verify all routes render in dev**

Run: `npm run dev` and check each route (after authenticating):
- `/job-search` — overview with 4 stat cards
- `/job-search/companies` — empty state with instructions
- `/job-search/network` — empty state with instructions
- `/job-search/materials` — empty state with instructions
- `/job-search/interviews` — empty state with tabs
- Tab navigation highlights the correct active tab on each page

- [ ] **Step 3: Test API routes with curl**

```bash
# Test companies POST (with auth)
curl -X POST http://localhost:3000/api/job-search/companies \
  -H "Authorization: Bearer $JOB_SEARCH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Anthropic","rank":1,"stage":"Series D","industry":"AI/ML","hiring_status":"active","product_focus":"Claude AI assistant and API"}'

# Test companies GET (with cookie — use browser or pass cookie header)
curl http://localhost:3000/api/job-search/companies \
  -H "Cookie: job_search_auth=$JOB_SEARCH_AUTH_SECRET"
```

Expected: POST returns 201 with created company. GET returns the company in the list.

- [ ] **Step 4: Verify the company shows in the frontend**

Refresh `/job-search/companies`. Expected: Anthropic appears in the table with rank 1, AI/ML industry, active hiring status.

- [ ] **Step 5: Verify overview stats update**

Refresh `/job-search`. Expected: Target Companies card shows 1.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "feat: job search hub — build verification and fixes"
```
