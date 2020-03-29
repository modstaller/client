'use strict';

const { join } = require('path');

const fs = require('fs-extra');

const { isAllowedByRules, osName, arch, downloadFile } = require('./utils');

class Libraries {
  constructor(list) {
    this.libraries = list;
  }

  async install(destination) {
    for (const library of this.libraries) {
      if (!isAllowedByRules(library)) {
        console.error(`skipping ${library.name} (not allowed by rules)`);
        continue;
      }

      let artifact;
      if (library.natives) {
        let nativesString = library.natives[osName];
        if (!nativesString) {
          console.error(
            `skipping ${library.name} (no natives for os ${osName})`,
          );
          continue;
        }
        if (nativesString.includes('${arch}')) {
          nativesString = nativesString.replace('${arch}', arch.slice(1));
        }
        artifact = library.downloads.classifiers[nativesString];
        if (!artifact) {
          console.error(
            `skipping ${library.name} (no natives artifact for ${nativesString})`,
          );
          continue;
        }
      } else {
        artifact = library.downloads.artifact;
      }

      const { path, url } = artifact;

      const destPath = join(destination, path);
      if (await fs.exists(destPath)) {
        console.error(`skipping ${library.name} (already downloaded)`);
        continue;
      }

      await downloadFile(url, destPath);
    }
  }
}

module.exports = { Libraries };
