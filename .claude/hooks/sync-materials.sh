#!/usr/bin/env bash
#
# Keeps the Materials tab in step with documents/.
#
# Wired to both PostToolUse and Stop, so it can be invoked many times a turn.
# The stamp-file gate below is what makes that cheap: if nothing under
# documents/ has changed since the last successful sync, this exits in a few
# milliseconds without touching the network.
#
# It ignores its stdin payload on purpose. Cover letter PDFs get rendered by
# scripts and shell commands, not just Write/Edit, so keying off a tool's
# file_path would miss them. The filesystem is the source of truth.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DOCS="$ROOT/documents"
STAMP="$ROOT/.claude/.materials-sync-stamp"

[ -d "$DOCS" ] || exit 0

if [ -f "$STAMP" ]; then
  # -newer catches directories too, so deletions (which bump the parent dir's
  # mtime without touching any file) still trigger a resync. Dotfiles are
  # pruned so .DS_Store churn doesn't.
  changed="$(find "$DOCS" -name '.*' -prune -o -newer "$STAMP" -print -quit 2>/dev/null)"
  [ -z "$changed" ] && exit 0
fi

# Render before syncing: a cover letter written as markdown needs its PDF to
# exist before the sync can attach and upload it. This is a no-op (~1s) when
# every PDF is already present.
output="$(cd "$ROOT" && node scripts/render-pdfs.mjs 2>&1 && node scripts/sync-materials.mjs 2>&1)"
status=$?

if [ $status -ne 0 ]; then
  # Exit 0 regardless: a sync failure shouldn't fail the tool call that
  # triggered it. Surface it as a message so it isn't silent either.
  printf '{"systemMessage":"Materials sync failed — run `npm run materials:sync` for details."}\n'
  echo "$output" >&2
  exit 0
fi

touch "$STAMP"
echo "$output"
