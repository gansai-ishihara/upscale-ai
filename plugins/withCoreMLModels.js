const { withXcodeProject } = require('expo/config-plugins');
const path = require('path');
const fs = require('fs');

const MODELS = [
  'RealESRGAN_x2plus.mlpackage',
  'RealESRGAN_x4plus.mlpackage',
];

function withCoreMLModels(config) {
  return withXcodeProject(config, async (config) => {
    const project = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const platformProjectRoot = config.modRequest.platformProjectRoot;

    // Xcode target name
    const targetName = config.modRequest.projectName;
    const groupName = targetName;

    // Source and destination paths
    const modelsSource = path.join(projectRoot, 'assets', 'models');
    const iosProjectDir = path.join(platformProjectRoot, targetName);

    for (const modelName of MODELS) {
      const srcPath = path.join(modelsSource, modelName);
      const destPath = path.join(iosProjectDir, modelName);

      // Copy mlpackage to iOS project directory
      if (fs.existsSync(srcPath)) {
        copyRecursiveSync(srcPath, destPath);

        // Add to Xcode project as resource
        const group = project.pbxGroupByName(groupName);
        if (group) {
          project.addResourceFile(
            modelName,
            { target: project.getFirstTarget().uuid },
            group.uuid
          );
        }
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
