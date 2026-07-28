[Skip to content](#VPContent)

[![](/vitepress-logo-mini.svg)VitePress](/)

Search`⌘``Ctrl``K`

 Main Navigation

* [Guide](/guide/what-is-vitepress)
* [Reference](/reference/site-config)
* 2.0.0-alpha.18

  + [1.6.4](https://vuejs.github.io/vitepress/v1/)
  + [Changelog](https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md)
  + [Contributing](https://github.com/vuejs/vitepress/blob/main/.github/contributing.md)

* English
* [简体中文](/zh/guide/getting-started)
* [Português](/pt/guide/getting-started)
* [Русский](/ru/guide/getting-started)
* [Español](/es/guide/getting-started)
* [한국어](/ko/guide/getting-started)
* [فارسی](/fa/guide/getting-started)
* [日本語](/ja/guide/getting-started)

* English
* [简体中文](/zh/guide/getting-started)
* [Português](/pt/guide/getting-started)
* [Русский](/ru/guide/getting-started)
* [Español](/es/guide/getting-started)
* [한국어](/ko/guide/getting-started)
* [فارسی](/fa/guide/getting-started)
* [日本語](/ja/guide/getting-started)

Appearance

Menu

Return to top

 Sidebar Navigation

## Introduction

* [What is VitePress?](/guide/what-is-vitepress)

  [Getting Started](/guide/getting-started)

  [Routing](/guide/routing)

  [Deploy](/guide/deploy)

## Writing

* [Markdown Extensions](/guide/markdown)

  [Asset Handling](/guide/asset-handling)

  [Frontmatter](/guide/frontmatter)

  [Using Vue in Markdown](/guide/using-vue)

  [Internationalization](/guide/i18n)

## Customization

* [Using a Custom Theme](/guide/custom-theme)

  [Extending the Default Theme](/guide/extending-default-theme)

  [Build-Time Data Loading](/guide/data-loading)

  [SSR Compatibility](/guide/ssr-compat)

  [Connecting to a CMS](/guide/cms)

## Experimental

* [MPA Mode](/guide/mpa-mode)

  [Sitemap Generation](/guide/sitemap-generation)

* [Config & API Reference](/reference/site-config)

On this page

Are you an LLM? You can read better optimized documentation at /guide/getting-started.md for this page in Markdown format

# Getting Started [​](#getting-started)

## Try It Online [​](#try-it-online)

You can try VitePress directly in your browser on [StackBlitz](https://vitepress.new).

## Installation [​](#installation)

### Prerequisites [​](#prerequisites)

* [Node.js](https://nodejs.org/) version 22 or higher.
* Terminal for accessing VitePress via its command line interface (CLI).
* Text Editor with [Markdown](https://en.wikipedia.org/wiki/Markdown) syntax support.
  + [VSCode](https://code.visualstudio.com/) is recommended, along with the [official Vue extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

VitePress can be used on its own, or be installed into an existing project. In both cases, you can install it with:

npmpnpmyarnbundeno

sh

```
$ npm add -D vitepress@next
```

sh

```
$ pnpm add -D vitepress@next
```

sh

```
$ yarn add -D vitepress@next vue
```

sh

```
$ bun add -D vitepress@next
```

sh

```
$ deno add -D vitepress@next
```

NOTE

VitePress is an ESM-only package. Don't use `require()` to import it, and make sure your nearest `package.json` contains `"type": "module"`, or change the file extension of your relevant files like `.vitepress/config.js` to `.mjs`/`.mts`. Refer to [Vite's troubleshooting guide](http://vite.dev/guide/troubleshooting.html#this-package-is-esm-only) for more details. Also, inside async CJS contexts, you can use `await import('vitepress')` instead.

### Setup Wizard [​](#setup-wizard)

VitePress ships with a command line setup wizard that will help you scaffold a basic project. After installation, start the wizard by running:

npmpnpmyarnbun

sh

```
$ npx vitepress init
```

sh

```
$ pnpm vitepress init
```

sh

```
$ yarn vitepress init
```

sh

```
$ bun vitepress init
```

You will be greeted with a few simple questions:

```
┌  Welcome to VitePress!
│
◇  Where should VitePress initialize the config?
│  ./docs
│
◇  Where should VitePress look for your markdown files?
│  ./docs
│
◇  Site title:
│  My Awesome Project
│
◇  Site description:
│  A VitePress Site
│
◇  Theme:
│  Default Theme
│
◇  Use TypeScript for config and theme files?
│  Yes
│
◇  Add VitePress npm scripts to package.json?
│  Yes
│
◇  Add a prefix for VitePress npm scripts?
│  Yes
│
◇  Prefix for VitePress npm scripts:
│  docs
│
└  Done! Now run pnpm run docs:dev and start writing.
```

Vue as Peer Dependency

If you intend to perform customization that uses Vue components or APIs, you should also explicitly install `vue` as a dependency.

## File Structure [​](#file-structure)

If you are building a standalone VitePress site, you can scaffold the site in your current directory (`./`). However, if you are installing VitePress in an existing project alongside other source code, it is recommended to scaffold the site in a nested directory (e.g. `./docs`) so that it is separate from the rest of the project.

Assuming you chose to scaffold the VitePress project in `./docs`, the generated file structure should look like this:

```
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

The `docs` directory is considered the **project root** of the VitePress site. The `.vitepress` directory is a reserved location for VitePress' config file, dev server cache, build output, and optional theme customization code.

TIP

By default, VitePress stores its dev server cache in `.vitepress/cache`, and the production build output in `.vitepress/dist`. If using Git, you should add them to your `.gitignore` file. These locations can also be [configured](./../reference/site-config#outdir).

### The Config File [​](#the-config-file)

The config file (`.vitepress/config.js`) allows you to customize various aspects of your VitePress site, with the most basic options being the title and description of the site:

.vitepress/config.js

js

```
export default {
  // site-level options
  title: 'VitePress',
  description: 'Just playing around.',

  themeConfig: {
    // theme-level options
  }
}
```

You can also configure the behavior of the theme via the `themeConfig` option. Consult the [Config Reference](./../reference/site-config) for full details on all config options.

### Source Files [​](#source-files)

Markdown files outside the `.vitepress` directory are considered **source files**.

VitePress uses **file-based routing**: each `.md` file is compiled into a corresponding `.html` file with the same path. For example, `index.md` will be compiled into `index.html`, and can be visited at the root path `/` of the resulting VitePress site.

VitePress also provides the ability to generate clean URLs, rewrite paths, and dynamically generate pages. These will be covered in the [Routing Guide](./routing).

## Up and Running [​](#up-and-running)

The tool should have also injected the following npm scripts to your `package.json` if you allowed it to do so during the setup process:

package.json

json

```
{
  ...
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  ...
}
```

The `docs:dev` script will start a local dev server with instant hot updates. Run it with the following command:

npmpnpmyarnbun

sh

```
$ npm run docs:dev
```

sh

```
$ pnpm run docs:dev
```

sh

```
$ yarn docs:dev
```

sh

```
$ bun run docs:dev
```

Instead of npm scripts, you can also invoke VitePress directly with:

npmpnpmyarnbun

sh

```
$ npx vitepress dev docs
```

sh

```
$ pnpm vitepress dev docs
```

sh

```
$ yarn vitepress dev docs
```

sh

```
$ bun vitepress dev docs
```

More command line usage is documented in the [CLI Reference](./../reference/cli).

The dev server should be running at `http://localhost:5173`. Visit the URL in your browser to see your new site in action!

## What's Next? [​](#what-s-next)

* To better understand how markdown files are mapped to generated HTML, proceed to the [Routing Guide](./routing).
* To discover more about what you can do on the page, such as writing markdown content or using Vue Components, refer to the "Writing" section of the guide. A great place to start would be to learn about [Markdown Extensions](./markdown).
* To explore the features provided by the default documentation theme, check out the [Default Theme Config Reference](./../reference/default-theme-config).
* If you want to further customize the appearance of your site, explore how to either [Extend the Default Theme](./extending-default-theme) or [Build a Custom Theme](./custom-theme).
* Once your documentation site takes shape, make sure to read the [Deployment Guide](./deploy).

[Edit this page on GitHub](https://github.com/vuejs/vitepress/edit/main/docs/en/guide/getting-started.md)

Last updated:

Pager

[Previous pageWhat is VitePress?](/guide/what-is-vitepress)

[Next pageRouting](/guide/routing)

Released under the MIT License.

Copyright © 2019-present Evan You