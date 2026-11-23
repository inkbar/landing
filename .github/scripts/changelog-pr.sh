#!/usr/bin/env bash
# Commits the drafted notes and opens a pull request, or adds them to the open one that already
# holds those releases. Reads changelog-run.json from the drafting step, which picks the branch:
# a release already in an open pull request is redrafted on its branch, without a force push,
# so the pull request's other notes and any edits stay. With DRY_RUN=1 it prints the git and gh
# commands that change anything instead of running them.
set -euo pipefail

run_step() {
  if [ "${DRY_RUN:-}" = 1 ]; then echo "+ $*"; else "$@"; fi
}

if [ "$(jq '.versions | length' changelog-run.json)" -eq 0 ]; then
  echo "Nothing to draft"
  exit 0
fi

branch=$(jq -r '.branch' changelog-run.json)
existing=$(jq -r '.existing' changelog-run.json)
title=$(jq -r '.title' changelog-run.json)
body_file=$(mktemp)
jq -r '.body' changelog-run.json > "$body_file"
drafts=$(mktemp -d)
jq -r '.versions[]' changelog-run.json | while read -r version; do
  cp "src/content/changelog/$version.md" "$drafts/"
done

if [ "${DRY_RUN:-}" != 1 ]; then
  user_id=$(gh api "/users/${APP_SLUG}%5Bbot%5D" --jq .id)
  git config user.name "${APP_SLUG}[bot]"
  git config user.email "${user_id}+${APP_SLUG}[bot]@users.noreply.github.com"
fi

if [ "$existing" = true ]; then
  # Put main's copy back, move to the pull request's branch, then lay the drafts over it.
  run_step git stash push --include-untracked -- src/content/changelog
  run_step git stash drop
  run_step git fetch origin "$branch"
  run_step git switch --track "origin/$branch"
  run_step cp "$drafts"/*.md src/content/changelog/
  run_step git add src/content/changelog
  if [ "${DRY_RUN:-}" != 1 ] && git diff --cached --quiet; then
    echo "The redrafted notes match the pull request's"
    exit 0
  fi
  run_step git commit -m "$title"
  run_step git push origin "$branch"
  number=$(gh pr list --head "$branch" --state open --json number --jq '.[0].number')
  run_step gh pr comment "$number" --body-file "$body_file"
else
  # A branch of this name can only be left from a closed pull request, so replacing it is safe.
  run_step git switch -c "$branch"
  run_step git add src/content/changelog
  run_step git commit -m "$title"
  run_step git push --force origin "$branch"
  run_step gh pr create --base main --head "$branch" --title "$title" --body-file "$body_file"
fi
