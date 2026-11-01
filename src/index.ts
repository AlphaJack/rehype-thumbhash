import path from "node:path";
import type { Element, Root } from "hast";
import sharp from "sharp";
import { rgbaToThumbHash, thumbHashToDataURL } from "thumbhash";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export interface Options {
  /**
   * The directory to resolve image paths from.
   */
  dir?: string;
  /**
   * The thumbhash format to display: base64 hash or PNG data URL.
   */
  format?: "hash" | "url";
  /**
   * The attribute where to store the original image path.
   */
  originalAttribute?: string;
  /**
   * The attribute where to store the thumbhash.
   */
  thumbhashAttribute?: string;
}

type Format = NonNullable<Options["format"]>;

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
 */
const rehypeThumbhash: Plugin<[Options?], Root> = function (options = {}) {
  const dir = options.dir;
  const format = options.format || "hash";
  const originalAttribute = options.originalAttribute || "src";
  const thumbhashAttribute = options.thumbhashAttribute || "data-thumbhash";
  const thumbhashCache = new Map<string, Promise<string | null>>();

  if (format !== "hash" && format !== "url") {
    throw new Error(
      `[rehype-thumbhash] Invalid format "${String(format)}", expected "hash" or "url"`,
    );
  }

  return async function transformer(tree) {
    const images: Element[] = [];

    // Collect all image nodes
    visit(tree, "element", (node) => {
      if (node.tagName === "img" && node.properties.src) {
        images.push(node);
      }
    });

    // Process each image node asynchronously
    await Promise.all(
      images.map(async (node) => {
        const src = String(node.properties.src);

        // Cache the promise, so repeated images are processed only once,
        // including concurrent ones and failures
        let thumbhash = thumbhashCache.get(src);
        if (!thumbhash) {
          thumbhash = getImageThumbhash(src, dir, format);
          thumbhashCache.set(src, thumbhash);
        }
        const result = await thumbhash;

        if (result) {
          node.properties[originalAttribute] = src;
          node.properties[thumbhashAttribute] = result;
        }
      }),
    );
  };
};

export default rehypeThumbhash;

/**
 * Asynchronously generates a thumbhash for a given image file.
 * @param src - The path to the image file.
 * @param dir - The directory containing the image file.
 * @param format - Base64 hash or PNG data URL.
 * @returns The thumbhash in the given format, or `null` if the image could not be processed.
 */
export async function getImageThumbhash(
  src: string,
  dir?: string,
  format: Format = "hash",
): Promise<string | null> {
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
    const { resizedWidth, resizedHeight, rgba } = await downscaleImageSharp(src);

    // Generate thumbhash based on specified format
    const thumbhashBinary = rgbaToThumbHash(resizedWidth, resizedHeight, rgba);

    // Return desired format
    return format === "url"
      ? thumbHashToDataURL(thumbhashBinary)
      : Buffer.from(thumbhashBinary).toString("base64");
  } catch (error) {
    console.error("[rehype-thumbhash] Skipped processing image due to error:", src);
    console.debug(error);
    return null;
  }
}

/**
 * Downscale an image to fit within a square of size 100x100. The image is
 * rotated if necessary, resized with the "inside" fit strategy, and ensured
 * to have an alpha channel.
 * @param src - The path to the image file.
 * @returns The downscaled image dimensions and its raw RGBA pixel data.
 */
export async function downscaleImageSharp(
  src: string,
): Promise<{ resizedWidth: number; resizedHeight: number; rgba: Uint8Array }> {
  const image = sharp(src).rotate().resize(100, 100, { fit: "inside" }).ensureAlpha();
  const { data: rgbaPixels, info } = await image.raw().toBuffer({ resolveWithObject: true });
  return { resizedWidth: info.width, resizedHeight: info.height, rgba: rgbaPixels };
}
