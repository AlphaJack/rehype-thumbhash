import { visit } from "unist-util-visit";
import { rgbaToThumbHash, thumbHashToDataURL } from "thumbhash";
//import { createCanvas, loadImage } from "@napi-rs/canvas";
import sharp from "sharp";
import path from "path";

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
 * @param {string} [options.originalAttribute] - Attribute pointing to the original image
 * @param {string} [options.thumbhashAttribute] - Attribute pointing to the thumbhash image
 * @returns {Function} A transformer function to be used with rehype
 */
function setImageThumbhash(options) {
  const opts = options || {};
  const dir = opts.dir;
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
          thumbhashDataURL = (await getImageThumbhash(src, dir)) || "";
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
async function getImageThumbhash(src, dir) {
  try {
    if (!src) {
      console.error("[rehype-thumbhash] Image src is undefined or null.");
      return null;
    }

    if (absolutePathRegex.test(src)) {
      // Skip absolute URLs
      return null;
    }

    // Determine if path should be joined with the directory
    const shouldJoin = !path.isAbsolute(src) || src.startsWith("/");
    if (dir && shouldJoin) {
      src = path.join(dir, src);
    }

    // Thumbhash doesn't support images larger than 100x100, so we downscale it
    const { resizedWidth, resizedHeight, rgba } =
      await downscaleImageSharp(src);
    //const { resizedWidth, resizedHeight, rgba } = await downscaleImageCanvas(src)

    // Generate thumbhash
    const thumbhashBinary = rgbaToThumbHash(resizedWidth, resizedHeight, rgba);
    //const thumbhashBase64 = Buffer.from(thumbhashBinary).toString('base64');
    const thumbhashDataURL = thumbHashToDataURL(thumbhashBinary);

    return thumbhashDataURL;
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
 * @returns {Promise<{width: number, height: number, rgbaPixels: Uint8Array}>}
 *     The downscaled image dimensions and its raw RGBA pixel data.
 */
async function downscaleImageSharp(src) {
  const maxSize = 100;
  let image = sharp(src).rotate();
  image = image.resize(maxSize, maxSize, { fit: "inside" });
  image = image.ensureAlpha();
  const { data: rgbaPixels, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  return { width, height, rgbaPixels };
}

/**
 * Downscale an image to fit within a square of size 100x100.
 * @param {string} src - The path to the image file.
 * @returns {Promise<{width: number, height: number, rgbaPixels: Uint8Array}>}
 *     The downscaled image dimensions and its raw RGBA pixel data.
 */
/*
async function downscaleImageCanvas(src) {
  const maxSize = 100;
  const image = await loadImage(src);
  const width = image.width;
  const height = image.height;

  const scale = Math.min(maxSize / width, maxSize / height);
  const resizedWidth = Math.floor(width * scale);
  const resizedHeight = Math.floor(height * scale);

  const canvas = createCanvas(resizedWidth, resizedHeight);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, resizedWidth, resizedHeight);

  const imageData = ctx.getImageData(0, 0, resizedWidth, resizedHeight);
  const rgba = new Uint8Array(imageData.data.buffer);
  return { resizedWidth, resizedHeight, rgba };
}
*/
