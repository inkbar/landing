#!/usr/bin/env bash
# Commits the drafted notes to a branch and opens a pull request, or updates the open one.
# Reads changelog-run.json from the drafting step. With DRY_RUN=1 it prints the git and gh
# commands instead of running them.
set -euo pipefail

run() {
  if [ "${DRY_RUN:-}" = 1 ]; then echo "+ $*"; else "$@"; fi
}

count=$(jq '.versions | length' changelog-run.json)
if [ "$count" -eq 0 ]; then
  echo "Nothing to draft"
  exit 0
fi

if [ "$count" -eq 1 ]; then
  version=$(jq -r '.versions[0]' changelog-run.json)
  branch="changelog/$version"
  title="docs: add the $version changelog"
else
  branch="changelog/backfill"
  title="docs: add changelogs for earlier releases"
fi
body_file=$(mktemp)
jq -r '.body' changelog-run.json > "$body_file"

if [ "${DRY_RUN:-}" != 1 ]; then
  user_id=$(gh api "/users/${APP_SLUG}%5Bbot%5D" --jq .id)
  git config user.name "${APP_SLUG}[bot]"
  git config user.email "${user_id}+${APP_SLUG}[bot]@users.noreply.github.com"
fi
run git switch -c "$branch"
run git add src/content/changelog
run git commit -m "$title"
run git push --force origin "$branch"

open=$(gh pr list --head "$branch" --state open --json number --jq '.[0].number // empty' || true)
if [ -n "$open" ]; then
  run gh pr edit "$open" --body-file "$body_file"
else
  run gh pr create --base main --head "$branch" --title "$title" --body-file "$body_file"
fi
