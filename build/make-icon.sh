#!/bin/sh
# Builds build/icon.icns from build/icon.png (1024x1024). Requires macOS sips + iconutil.
set -e
cd "$(dirname "$0")"
rm -rf icon.iconset && mkdir icon.iconset
for s in 16 32 128 256 512; do
  sips -z $s $s icon.png --out icon.iconset/icon_${s}x${s}.png >/dev/null
  sips -z $((s*2)) $((s*2)) icon.png --out icon.iconset/icon_${s}x${s}@2x.png >/dev/null
done
iconutil -c icns icon.iconset -o icon.icns
rm -rf icon.iconset
echo "wrote build/icon.icns"
