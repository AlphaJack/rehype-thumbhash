import { Plugin } from 'unified';
import { Root } from 'hast';

export interface Options {
    /**
     * The directory to resolve image paths from.
     */
    dir?: string;
}

declare const rehypeThumbhash: Plugin<[Options?], Root, Root>;

export default rehypeThumbhash;
