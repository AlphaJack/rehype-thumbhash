import { strict as assert } from "assert";
import { rehype } from "rehype";
import rehypeThumbhash from "./index.js";

(async () => {
  try {
    const expectedOutput =
      '<html><head></head><body><img src="example.jpg" data-thumbhash="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAAAAAAgCAYAAAA8J3kkAAAAxklEQVR4AQABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAABAP7/AAEBAP7/AAAgAAHflHy2AAAAAElFTkSuQmCC"></body></html>';
    console.time("converted-in");
    const file = await rehype()
      .use(rehypeThumbhash, { dir: "./" })
      .process('<img src="example.jpg">');

    const output = String(file).trim();
    console.timeEnd("converted-in");
    assert.strictEqual(output, expectedOutput);
    console.log("Test passed:", output);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1); // Exit with status code 1 when the test fails
  }
})();
