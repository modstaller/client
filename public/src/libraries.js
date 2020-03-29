'use strict';

const { pipeline } = require('stream');
const { join, dirname } = require('path');
const { promisify } = require('util');

const fs = require('fs-extra');
const got = require('got');

const { isAllowedByRules, osName, arch } = require('./utils');

const pipelinePromise = promisify(pipeline);

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

      await fs.ensureDir(dirname(destPath));
      await pipelinePromise(got.stream(url), fs.createWriteStream(destPath));
    }
  }
}

module.exports = { Libraries };
