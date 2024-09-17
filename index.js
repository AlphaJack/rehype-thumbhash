import { visit } from "unist-util-visit";
import { rgbaToThumbHash, thumbHashToDataURL } from "thumbhash";
import sharp from "sharp";
import path from "path";

// usage
export default setImageThumbhash;
// test
export { getImageThumbhash, downscaleImageSharp };

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
 * @param {string} [options.originalAttribute] - Attribute pointing to the original image
 * @param {string} [options.thumbhashAttribute] - Attribute pointing to the thumbhash image
 * @returns {Function} A transformer function to be used with rehype
 */
function setImageThumbhash(options) {
  const opts = options || {};
  const dir = opts.dir;
  const format = opts.format || "hash";
  const originalAttribute = opts.originalAttribute || "src";
  const thumbhashAttribute = opts.thumbhashAttribute || "data-thumbhash";
  const thumbhashCache = {};

  return async function transformer(tree, file) {
    const images = [];

    // Collect all image nodes
    visit(tree, "element", (node) => {
      if (node.tagName === "img" && node.properties && node.properties.src) {
        images.push(node);
      }
    });

    // Process each image node asynchronously
    await Promise.all(
      images.map(async (node) => {
        const src = node.properties.src;

        // Check if thumbhash is already in cache
        let thumbhashDataURL = thumbhashCache[src];
        if (!thumbhashDataURL) {
          thumbhashDataURL = (await getImageThumbhash(src, dir, format)) || "";
          thumbhashCache[src] = thumbhashDataURL;
        }

        // Ensure properties object exists
        if (!node.properties) {
          node.properties = {};
        }
        if (thumbhashDataURL !== "") {
          node.properties[originalAttribute] = src;
          node.properties[thumbhashAttribute] = thumbhashDataURL;
        }
      }),
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
async function getImageThumbhash(src, dir, format) {
  let thumbhashFormatted = null;
  if (!src || absolutePathRegex.test(src)) {
    // Skip undefined images or absolute URLS
    return null;
  }

  // Determine if path should be joined with the directory
  const shouldJoin = !path.isAbsolute(src) || src.startsWith("/");
  if (dir && shouldJoin) {
    src = path.join(dir, src);
  }

  try {
    // Thumbhash doesn't support images larger than 100x100, so we downscale it
    const { resizedWidth, resizedHeight, rgba } =
      await downscaleImageSharp(src);

    // Generate thumbhash based on specified format
    const thumbhashBinary = rgbaToThumbHash(resizedWidth, resizedHeight, rgba);

    // Return desider format
    if (format === "url") {
      thumbhashFormatted = thumbHashToDataURL(thumbhashBinary);
    } else if (format === "hash") {
      thumbhashFormatted = Buffer.from(thumbhashBinary).toString("base64");
    } else {
      thumbhashFormatted = null;
    }
    return thumbhashFormatted;
  } catch (error) {
    console.error(
      "[rehype-thumbhash] Skipped processing image due to error:",
      src,
    );
    console.debug(error);
    return null;
  }
}

/**
 * Downscale an image to fit within a square of size 100x100. The image is
 * rotated if necessary, resized with the "inside" fit strategy, and ensured
 * to have an alpha channel.
 * @param {string} src - The path to the image file.
 * @returns {Promise<{resizedWidth: number, resizedHeight: number, rgba: Uint8Array}>}
 *     The downscaled image dimensions and its raw RGBA pixel data.
 */
async function downscaleImageSharp(src) {
  let image = sharp(src).rotate();
  image = image.resize(100, 100, { fit: "inside" });
  image = image.ensureAlpha();
  const { data: rgbaPixels, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  return { resizedWidth: width, resizedHeight: height, rgba: rgbaPixels };
}
