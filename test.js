import { strict as assert } from 'assert';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import rehypeThumbhash from './index.js';

(async () => {
  try {
    const expectedOutput = '<img src="example.jpg" data-thumbhash="ZhgODYKHh3l/ioh0d5hohkVtEOYG">';

    const file = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeThumbhash, { dir: './' })
      .use(rehypeStringify)
      .process('<img src="example.jpg">');

    const output = String(file).trim();

    assert.strictEqual(output, expectedOutput);
    console.log('Test passed: <img src="example.jpg" data-thumbhash="ZhgODYKHh3l/ioh0d5hohkVtEOYG">');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1); // Exit with status code 1 when the test fails
  }
})();
