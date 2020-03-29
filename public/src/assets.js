'use strict';

const { join } = require('path');

const fs = require('fs-extra');

const { downloadFile, gotBase } = require('./utils');

class Assets {
  async install(destination, url, version) {
    const { body: assetMetadata } = await gotBase.get(url);
    await fs.outputJson(
      join(destination, `indexes/${version}.json`),
      assetMetadata,
    );
    for (const asset of Object.values(assetMetadata.objects)) {
      const filename = `${asset.hash.substring(0, 2)}/${asset.hash}`;
      const assetPath = join(destination, 'objects', filename);
      if (await fs.exists(assetPath)) {
        continue;
      }
      await downloadFile(
        `https://resources.download.minecraft.net/${filename}`,
        assetPath,
      );
    }
  }
}

module.exports = { Assets };
