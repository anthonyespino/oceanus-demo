#!/bin/zsh
# Double-click launcher for the Oceanus greybox demo (macOS equivalent of a
# .bat file). Starts the dev server if it isn't running and opens the fleet
# view in the default browser. Close this Terminal window to stop the server.
set -e
cd "$(dirname "$0")"

# One-time cosmetic: give this launcher a recognizable Oceanus icon in Finder.
# The icon lives in the resource fork (not tracked by git), so re-apply it once
# per clone. Backgrounded and best-effort — it never blocks or fails the launch.
if ! xattr "$0" 2>/dev/null | grep -q com.apple.ResourceFork; then
  [ -x ./scripts/set-launcher-icon.sh ] && ./scripts/set-launcher-icon.sh >/dev/null 2>&1 &
fi

PORT=3000
URL="http://localhost:$PORT"

# Already running? Just open the browser.
if curl -s -o /dev/null --max-time 2 "$URL"; then
  open "$URL"
  exit 0
fi

# First run on a fresh clone: install dependencies.
if [ ! -d node_modules ]; then
  echo "Installing dependencies (first run only)…"
  npm install
fi

echo "Starting Oceanus demo…"
npm run dev -- -p "$PORT" &
SERVER_PID=$!

# Wait until the server answers, then open the fleet view.
for i in {1..60}; do
  sleep 1
  if curl -s -o /dev/null "$URL"; then
    break
  fi
done
open "$URL"

echo ""
echo "Oceanus demo running at $URL"
echo "Keep this window open while presenting. Close it (or Ctrl+C) to stop."
wait "$SERVER_PID"
