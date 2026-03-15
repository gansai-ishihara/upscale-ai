const {
  withXcodeProject,
  IOSConfig,
} = require('expo/config-plugins');
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
    const targetUuid = target.uuid;

    // Get the main group key for the project
    const mainGroupId = project.getFirstProject().firstProject.mainGroup;

    for (const modelName of MODELS) {
      const srcPath = path.join(modelsSource, modelName);
      const destPath = path.join(iosProjectDir, modelName);

      if (!fs.existsSync(srcPath)) continue;

      // Copy mlpackage directory into iOS project
      copyRecursiveSync(srcPath, destPath);

      // Manually create PBXFileReference for the mlpackage folder
      const fileRefUuid = project.generateUuid();
      const buildFileUuid = project.generateUuid();

      // Add PBXFileReference
      if (!project.hash.project.objects['PBXFileReference']) {
        project.hash.project.objects['PBXFileReference'] = {};
      }
      project.hash.project.objects['PBXFileReference'][fileRefUuid] = {
        isa: 'PBXFileReference',
        lastKnownFileType: 'folder',
        name: modelName,
        path: `${targetName}/${modelName}`,
        sourceTree: '"<group>"',
      };
      project.hash.project.objects['PBXFileReference'][`${fileRefUuid}_comment`] = modelName;

      // Add to main group's children
      const mainGroup = project.hash.project.objects['PBXGroup'][mainGroupId];
      if (mainGroup && mainGroup.children) {
        mainGroup.children.push({
          value: fileRefUuid,
          comment: modelName,
        });
      }

      // Add PBXBuildFile
      if (!project.hash.project.objects['PBXBuildFile']) {
        project.hash.project.objects['PBXBuildFile'] = {};
      }
      project.hash.project.objects['PBXBuildFile'][buildFileUuid] = {
        isa: 'PBXBuildFile',
        fileRef: fileRefUuid,
        fileRef_comment: modelName,
      };
      project.hash.project.objects['PBXBuildFile'][`${buildFileUuid}_comment`] = `${modelName} in Resources`;

      // Add to PBXResourcesBuildPhase
      const resourcesBuildPhase = project.hash.project.objects['PBXResourcesBuildPhase'];
      for (const key of Object.keys(resourcesBuildPhase)) {
        if (key.endsWith('_comment')) continue;
        const phase = resourcesBuildPhase[key];
        if (phase && phase.files) {
          phase.files.push({
            value: buildFileUuid,
            comment: `${modelName} in Resources`,
          });
          break;
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
