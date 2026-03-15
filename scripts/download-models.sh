#!/bin/bash
# CoreMLモデルをGitHub Artifactsからダウンロードして展開する
set -e

REPO="gansai-ishihara/upscale-ai"
DEST="assets/models"
mkdir -p "$DEST"

echo "Downloading CoreML models from GitHub Artifacts..."

# x2plus
echo "  -> RealESRGAN_x2plus..."
gh run download --repo "$REPO" \
  --name "RealESRGAN-x2plus-coreml-tile256-float16" \
  --dir /tmp/models-dl
unzip -o /tmp/models-dl/RealESRGAN_x2plus_coreml.zip -d "$DEST"

# x4plus
echo "  -> RealESRGAN_x4plus..."
gh run download --repo "$REPO" \
  --name "RealESRGAN-x4plus-coreml-tile256-float16" \
  --dir /tmp/models-dl
unzip -o /tmp/models-dl/RealESRGAN_x4plus_coreml.zip -d "$DEST"

# x4plus_anime
echo "  -> RealESRGAN_x4plus_anime..."
gh run download --repo "$REPO" \
  --name "RealESRGAN-x4plus_anime-coreml-tile256-float16" \
  --dir /tmp/models-dl
unzip -o /tmp/models-dl/RealESRGAN_x4plus_anime_coreml.zip -d "$DEST"

rm -rf /tmp/models-dl

echo "Done! Models in $DEST:"
ls -lh "$DEST"
