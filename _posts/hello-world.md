---
date: 2016-09-04
title: Hello World
tags:
math: true
summaryLength: 5
---

Hello world. This blog is server side rendered using Vue 2. More on that in another post.

The rest of this post will serve as an example of markdown rendering.

---

This is what *italics*, **bold**, `inline code`, and [links](http://jmazz.me) look like.

---

Code highlighting using [highlight.js][highlight.js]:

```javascript
console.log('Hello world')
```

Due to the way I pass a custom code renderer to [marked][marked], syntax colours
can be easily swapped by requiring different themes. <!-- This was [not as
simple][hexo-apollo-commit] with [Hexo][hexo]. -->

[hexo]: https://hexo.io/
[hexo-apollo-commit]: https://github.com/thejmazz/hexo-theme-apollo/commit/65dfd4806f02b85fd3200bf516283f5b20925578

```javascript
const marked = require('marked')
const hljs = require('highlight.js')

const mdRenderer = new marked.Renderer()
mdRenderer.code = (code, lang) => {
  if (lang) {
    code = hljs.highlight(lang, code).value
  }

  return `<pre><code class="hljs lang-${lang}">${code}</code></pre>`
}

marked.setOptions({ renderer: mdRenderer })
```

```css
@import "~highlight.js/styles/solarized-light.css";
```

[highlight.js]: https://highlightjs.org
[marked]: https://github.com/chjj/marked

---

Math rendering is provided via $\KaTeX$ ([KaTeX][KaTeX]) and [parse-katex][parse-katex].
All rendering can be ran server-side and the client only needs to include the
css and fonts.  It is ran over the text in [render
methods][marked-block-level-render-methods] in the marked renderer. For example:

[marked-block-level-render-methods]: https://github.com/chjj/marked#block-level-renderer-methods

```javascript
mdRenderer.listitem = (text) => `<li>${parseKatex.render(text)}</li>\n`
```

By omitting the KaTeX parser from code sections, you do not need to worry about
escaping $ in code blocks. Which is fortunate, because otherwise bash scripts
would be a nightmare:

```bash
export NODE_PATH="/usr/local/node/bin"
export PATH="$PATH:$NODE_PATH"
```

Inline math done using \$ to surround content; `for \$n\$ in \$\mathbb{N}\$` $\rightarrow$ for $n$ in $\mathbb{N}$.

- math looks so $n$ice

Display mode math done using $$ to surround content:

$$ \int_0^\infty x^3 $$


[KaTeX]: https://khan.github.io/KaTeX/
[parse-katex]: https://github.com/joshuacaron/parse-katex

---

Unordered list:

- arbitrary item
  - nested
    - double nested
- another arbitrary item

Ordered list:

1. pseudo non-arbitrary ordered item
  1. nested
    1. double nested
2. another pseudo non-arbitrary ordered item

---

# Header 1

## Header 2

### Header 3

#### Header 4

##### Header 5

###### Header 6

---

Table:

| x | y  |
|:--|:---|
| 0 | 5  |
| 1 | 10 |
| 2 | 15 |

---

Images:

Images are wrapped within a `<figure>` and use a caption if `title` is provided.

```javascript
mdRenderer.image = function(href, title, text) {
  const id = Math.floor(Math.random() * 10000)

  const out = `
  <figure id="img-wrapper-${id}" class="img-wrapper">
    <img id="img-${id}" src="${href}" alt="${text}" @click="imageClick" ${title ? `title="${title}"` : ''}>
    ${title ? `<figcaption>${title}</figcaption>`: ''}
  </figure>
  `.trim()

  return out
}
```

Unfortunately, highlight.js seems to fail on multiline template literals :(

> Template Literals: Poor Man's JSX &trade;

Note the `@click="imageClick"`. This is a Vue binding. In the post component
`updated` lifecycle method, a mini app is initialised if we are in the client.
This little app uses the post content as its template. Since `imageClick` is
provided in the `methods` property, we can easily hook into the click event.

```javascript
updated() {
  if (window) {
    const postApp = new window.StandaloneVue({
      el: `#${this.post.slug}`,
      methods: {
        imageClick: function({ target }) {
          // handle image click
        }
      }
    })
  }
}
```

`![alt text](/static/nodes_4000_theta_4.png "4000 Nodes")`

![4000 Nodes](/static/nodes_4000_theta_4.png "Some Nodes")

`![Digital Ocean Toronto](/static/do-toronto.png)`

![Digital Ocean Toronto](/static/do-toronto.png)

---

Quote:

> The only difference between a drug and a computer is that one is slightly too
> large to swallow. ... And our best people are working on that problem, even as
> we speak.
>
> -Terence McKenna

And there have been `<hr>`s throughout.
