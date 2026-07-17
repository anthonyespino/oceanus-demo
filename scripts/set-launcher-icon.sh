#!/bin/zsh
# Applies the Oceanus mark as the Finder icon of "Launch Oceanus Demo.command".
# The icon lives in the file's HFS resource fork, which git does NOT track — so
# run this once per machine/clone to make the launcher easy to spot in Finder.
# Idempotent and macOS-only (uses sips / iconutil / osascript). Cosmetic: never
# affects how the demo runs.
set -e
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
SRC_SVG="$ROOT/docs/launcher-icon.svg"
TARGET="$ROOT/Launch Oceanus Demo.command"

[ -f "$SRC_SVG" ] || { echo "missing $SRC_SVG"; exit 1; }
[ -f "$TARGET" ]  || { echo "missing launcher: $TARGET"; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# 1) SVG -> 1024px PNG via QuickLook (no external deps).
qlmanage -t -s 1024 -o "$TMP" "$SRC_SVG" >/dev/null 2>&1
PNG="$TMP/launcher-icon.svg.png"
[ -f "$PNG" ] || { echo "icon render failed"; exit 1; }

# 2) PNG -> multi-resolution .icns.
ICONSET="$TMP/oceanus.iconset"; mkdir -p "$ICONSET"
for sz in 16 32 128 256 512; do
  sips -z "$sz" "$sz" "$PNG" --out "$ICONSET/icon_${sz}x${sz}.png" >/dev/null 2>&1
  d=$((sz * 2))
  sips -z "$d" "$d" "$PNG" --out "$ICONSET/icon_${sz}x${sz}@2x.png" >/dev/null 2>&1
done
iconutil -c icns "$ICONSET" -o "$TMP/oceanus.icns"

# 3) Attach it to the launcher's resource fork.
osascript - "$TMP/oceanus.icns" "$TARGET" <<'OSA'
use framework "AppKit"
use scripting additions
on run argv
  set img to current application's NSImage's alloc()'s initWithContentsOfFile:(item 1 of argv)
  current application's NSWorkspace's sharedWorkspace()'s setIcon:img forFile:(item 2 of argv) options:0
end run
OSA

echo "Applied Oceanus icon to: $TARGET"
