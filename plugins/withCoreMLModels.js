const { withXcodeProject } = require('expo/config-plugins');
const path = require('path');
const fs = require('fs');

const MODELS = [
  'RealESRGAN_x2plus.mlpackage',
  'RealESRGAN_x4plus.mlpackage',
  'RealESRGAN_x4plus_anime.mlpackage',
];

function withCoreMLModels(config) {
  return withXcodeProject(config, async (config) => {
    const project = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const platformProjectRoot = config.modRequest.platformProjectRoot;
    const targetName = config.modRequest.projectName;

    const modelsSource = path.join(projectRoot, 'assets', 'models');
    const iosProjectDir = path.join(platformProjectRoot, targetName);

    const target = project.getFirstTarget();

    for (const modelName of MODELS) {
      const srcPath = path.join(modelsSource, modelName);
      const destPath = path.join(iosProjectDir, modelName);

      if (!fs.existsSync(srcPath)) continue;

      // Copy mlpackage directory to iOS project
      copyRecursiveSync(srcPath, destPath);

      // Add as folder reference to Xcode project
      // Use addFile with lastKnownFileType for mlpackage
      const file = project.addFile(
        modelName,
        project.getFirstProject().uuid,
        {
          lastKnownFileType: 'folder',
          sourceTree: '"<group>"',
          path: modelName,
        }
      );

      if (file) {
        // Add to Resources build phase
        project.addToPbxResourcesBuildPhase(file);
      }
    }

    return config;
  });
}

function copyRecursiveSync(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

module.exports = withCoreMLModels;
