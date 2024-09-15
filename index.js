import path from 'path';
import sharp from 'sharp';
import { visit } from 'unist-util-visit';
import { rgbaToThumbHash } from 'thumbhash';

export default setImageThumbhash;

const absolutePathRegex = /^(?:[a-z]+:)?\/\//;

/**
 * Rehype plugin that generates thumbhash for images and adds them as
 * `data-thumbhash` attributes.
 *
 * The `dir` option can be used to specify the directory containing the images.
 * The images are resolved relative to this directory. If the `dir` option is
 * not specified, the images are resolved relative to the current working
 * directory.
 *
 * The `dir` option is useful when you are processing files that are not in the
 * same directory as the images they reference.
 *
 * @param {Object} options - Plugin options
 * @param {string} [options.dir] - Directory containing the images
 * @returns {Function} A transformer function to be used with rehype
 */
function setImageThumbhash(options) {
  const opts = options || {};
  const dir = opts.dir;
  const thumbhashCache = {};

  return async function transformer(tree, file) {
    const images = [];

    // Collect all image nodes
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img' && node.properties && node.properties.src) {
        images.push(node);
      }
    });

    // Process each image node asynchronously
    await Promise.all(
      images.map(async (node) => {
        const src = node.properties.src;

        // Check if thumbhash is already in cache
        let base64thumbhash = thumbhashCache[src];
        if (!base64thumbhash) {
          base64thumbhash = (await getImageThumbhash(src, dir)) || '';
          thumbhashCache[src] = base64thumbhash;
        }

        // Ensure properties object exists
        if (!node.properties) {
          node.properties = {};
        }
        node.properties['data-thumbhash'] = base64thumbhash;
      })
    );
  };
}

  /**
   * Asynchronously generates a thumbhash for a given image file.
   * @param {string} src - The path to the image file.
   * @param {string} [dir] - The directory containing the image file.
   * @returns {Promise<string|null>} The thumbhash as a base64-encoded string,
   *     or `null` if the image could not be processed.
   */
async function getImageThumbhash(src, dir) {
  try {
    if (!src) {
      console.error('[rehype-thumbhash] Image src is undefined or null.');
      return null;
    }

    if (absolutePathRegex.test(src)) {
      // Skip absolute URLs
      return null;
    }

    // Determine if path should be joined with the directory
    const shouldJoin = !path.isAbsolute(src) || src.startsWith('/');
    if (dir && shouldJoin) {
      src = path.join(dir, src);
    }

    // Thumbhash doesn't process images larger than 100x1004
    const maxDimension = 100;
    let image = sharp(src).rotate();

    // Resize the image to fit within 100x100 pixels if necessary
    image = image.resize(maxDimension, maxDimension, { fit: 'inside' });

    // Ensure the image is in RGBA format
    image = image.ensureAlpha();

    // Get the raw pixel data and new dimensions
    const { data: rgbaPixels, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });
    const { width, height } = info;

    // Generate thumbhash
    const hash = rgbaToThumbHash(width, height, rgbaPixels);
    const base64thumbhash = Buffer.from(hash).toString('base64');
    return base64thumbhash;
  } catch (error) {
    console.error('[rehype-thumbhash] Skipped processing image due to error:', src);
    console.debug(error);
    return null;
  }
}
