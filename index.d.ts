import { Plugin } from "unified";
import { Root } from "hast";

export interface Options {
  /**
   * The directory to resolve image paths from.
   */
  dir?: string;
  /**
   * The attribute where to store the original image path.
   */
  originalAttribute?: string;
  /**
   * The attribute where to store the thumbhash base64 png image
   */
  thumbhashAttribute?: string;
}

declare const rehypeThumbhash: Plugin<[Options?], Root, Root>;

export default rehypeThumbhash;
