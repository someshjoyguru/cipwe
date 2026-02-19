#!/bin/bash
# ============================================================
# Package CIPWE Chrome Extension into a .zip for distribution
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXT_DIR="$SCRIPT_DIR"
OUT_DIR="$SCRIPT_DIR/../website/public"
ZIP_NAME="cipwe-chrome-extension.zip"

echo "📦 Packaging CIPWE Chrome Extension..."

# Create output dir if needed
mkdir -p "$OUT_DIR"

# Remove old zip
rm -f "$OUT_DIR/$ZIP_NAME"

# Create zip (exclude dev files)
cd "$EXT_DIR"
zip -r "$OUT_DIR/$ZIP_NAME" \
  manifest.json \
  popup/ \
  analyzer/ \
  content/ \
  background/ \
  icons/*.png \
  -x "*.DS_Store" "*.svg" "*.sh"

echo ""
echo "✅ Created: website/public/$ZIP_NAME"
echo "   Size: $(du -h "$OUT_DIR/$ZIP_NAME" | cut -f1)"
echo ""
echo "Users can download and sideload via chrome://extensions"
