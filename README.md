# rehype-thumbhash

A [rehype](https://github.com/rehypejs/rehype) plugin that generates small thumbnails using from **local** images using [sharp](https://www.npmjs.com/package/sharp) and [thumbhash](https://github.com/evanw/thumbhash), and adds stores as `data-thumbhash` attributes.  
These thumbnails can then be used by client-side libraries such as [lazysizes](https://github.com/aFarkas/lazysizes?tab=readme-ov-file#lqipblurry-image-placeholderblur-up-image-technique).

## Install

```sh
npm install rehype-thumbhash
```

## Options

Optional:

- `dir`: prefix to local images
- `format`: thumbhash format, either "hash" or "url". Defaults to "hash".
- `originalAttribute`: attribute where to store the original "src". Defaults to "src".
- `thumbhashAttribute`: attribute where to store the thumbhash image. Defaults to "data-thumbhash".

## Usage

```js
import { rehype } from "rehype";
import rehypeThumbhash from "rehypeThumbhash";

rehype()
  .use(rehypeThumbhash, { dir: "./" })
  .process('<img src="example.jpg">', function (err, file) {
    if (err) throw err;
    console.log(String(file));
  });
```

Expected output:

```html
<html>
  <head></head>
  <body>
    <img
      src="example.jpg"
      data-thumbhash="data:image/png;base64,iVBORw0KGgoAAA..."
    />
  </body>
</html>
```
