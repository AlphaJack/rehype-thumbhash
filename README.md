# rehype-thumbhash

A [rehype](https://github.com/rehypejs/rehype) plugin that generates [thumbhash](https://github.com/evanw/thumbhash) hashes for **local** images and adds them as `data-thumbhash` attributes. 
These hashes can be then used client-side to generate fast-loading thumbnails.

## Install

```sh
npm install rehype-thumbhash
```

## Options

- `dir` (optional): prefix to local images

## Usage

```js
import { rehype } from 'rehype';
import rehypeThumbhash from 'rehypeThumbhash';

rehype()
  .use(rehypeThumbhash, { dir: './' })
  .process('<img src="example.jpg">', function (err, file) {
    if (err) throw err;
    console.log(String(file));
  });
```
