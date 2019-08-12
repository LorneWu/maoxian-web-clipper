;(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // CJS
    module.exports = factory(
      require('../lib/tool.js'),
      require('../lib/asset.js'),
      require('../lib/task.js')
    );
  } else {
    // browser or other
    root.MxWcCaptureTool = factory(
      root.MxWcTool,
      root.MxWcAsset,
      root.MxWcTask
    );
  }
})(this, function(T, Asset, Task, undefined) {
  "use strict";

  /**
   * capture srcset of <img> element
   * and <source> element in <picture>
   * @return {Array} imagetasks
   */
  function captureImageSrcset(node, {baseUrl, storageInfo, clipId, mimeTypeDict = {}}) {
    const srcset = node.getAttribute('srcset');
    const tasks = [];
    if (srcset) {
      const arr = parseSrcset(srcset);
      let mimeType = null;
      if (node.tagName.toLowerCase() === 'source') {
        mimeType = node.getAttribute('type');
      }
      const newSrcset = arr.map((item) => {
        const [itemSrc] = item;
        const {isValid, url, message} = T.completeUrl(itemSrc, baseUrl);
        if (isValid) {
          if (!mimeType) { mimeType = mimeTypeDict[url] }
          const {
            filename: assetFilename,
            url: assetPath
          } = Asset.calcInfo(url, storageInfo, mimeType, clipId);
          const task = Task.createImageTask(assetFilename, url, clipId);
          tasks.push(task);
          item[0] = assetPath;
        } else {
          item[0] = 'invalid-url.png';
        }
        return item.join(' ');
      }).join(',');
      node.setAttribute('srcset', newSrcset);
    }
    return tasks;
  }

  /**
   *
   * @param {String} srcset
   *
   * @return {Array} srcset
   *   - {Array} item
   *     - {String} url
   *     - {String} widthDescriptor
   *     - {String} pixelDensityDescriptor
   *
   */
  function parseSrcset(srcset) {
    const items = srcset.split(',');
    return [].map.call(items, (it) => {
      return it.trim().split(/\s+/);
    });
  }


  return {
    captureImageSrcset: captureImageSrcset,
    parseSrcset: parseSrcset,
  }

});

