---
title: "Next.js | Fumadocs"
source: "https://www.fumadocs.dev/docs/manual-installation/next"
captured_at: "2026-07-28T12:27:25.694Z"
language: "en"
description: "Setup Fumadocs on Next.js."
canonical: "https://www.fumadocs.dev/docs/manual-installation/next"
extractor: "page2ai-core"
extractor_version: "0.1.0"
---

# Next.js | Fumadocs

[Manual Installation](https://www.fumadocs.dev/docs/manual-installation)

# Next.js

Setup Fumadocs on Next.js.

## [Prerequisite](https://www.fumadocs.dev/docs/manual-installation/next#prerequisite)

Before continuing, make sure you have configured:

- Next.js 16.
- Tailwind CSS 4.

We will use [Fumadocs MDX](https://www.fumadocs.dev/docs/mdx) as a content source, you can configure it first:

### [Installation](https://www.fumadocs.dev/docs/manual-installation/next#installation)

```
npm i fumadocs-mdx fumadocs-core @types/mdx
```

Create the configuration file:

```
import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig();
```

Add the plugin to Next.js config:

```
import { createMDX } from 'fumadocs-mdx/next';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
};

const withMDX = createMDX({
  // customize the config file path
  // configPath: "source.config.ts"
});

export default withMDX(config);
```

ESM Only

Fumadocs MDX is ESM-only, it ' s recommended to use `next.config.mjs` for accurate ESM resolution.

For TypeScript config file, it requires Native Node.js TypeScript Resolver, you can see [Next.js docs](https://nextjs.org/docs/app/api-reference/config/typescript#using-nodejs-native-typescript-resolver-for-nextconfigts) for details.

Setup an import alias (recommended):

```
{
  "compilerOptions": {
    "paths": {
      "collections/*": ["./.source/*"]
    }
  }
}
```

### [Integrate with Fumadocs](https://www.fumadocs.dev/docs/manual-installation/next#integrate-with-fumadocs)

You can create a `lib/source.ts` file and obtain Fumadocs source from the `docs` collection output.

```
import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});
```

The `.source` folder will be generated when you run `next dev` or `next build` .

### [Done](https://www.fumadocs.dev/docs/manual-installation/next#done)

You can now write content in `content/docs` folder.

Good to Know

Fumadocs also supports other content sources, including [Content Collections](https://www.fumadocs.dev/docs/headless/content-collections) and headless CMS.

## [Getting Started](https://www.fumadocs.dev/docs/manual-installation/next#getting-started)

```
npm i fumadocs-ui fumadocs-core
```

### [Root Layout](https://www.fumadocs.dev/docs/manual-installation/next#root-layout)

Wrap the entire application inside [Root Provider](https://www.fumadocs.dev/docs/ui/layouts/root-provider) , and add required styles to `body` .

```
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        // required styles
        className="flex flex-col min-h-screen"
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
```

### [Styles](https://www.fumadocs.dev/docs/manual-installation/next#styles)

Add the following Tailwind CSS styles to `global.css` .

```
@import 'tailwindcss';
@import 'fumadocs-ui/css/neutral.css';
@import 'fumadocs-ui/css/preset.css';
```

It doesn ' t come with a default font, you may choose one from `next/font` .

### [Routes](https://www.fumadocs.dev/docs/manual-installation/next#routes)

Create a `lib/layout.shared.tsx` file to put the shared options for our layouts.

```
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'My App',
    },
  };
}
```

Create the following files & routes:

```
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
```

The search is powered by Orama, learn more about [Document Search](https://www.fumadocs.dev/docs/headless/search) .

### [Finish](https://www.fumadocs.dev/docs/manual-installation/next#finish)

You can start the dev server and create MDX files.

```
---
title: Hello World
---

## Introduction

I love Anime.
```

How is this guide?

Last updated on

[Astro Setup Fumadocs on Astro with React islands.](https://www.fumadocs.dev/docs/manual-installation/astro)
[React Router Setup Fumadocs on React Router.](https://www.fumadocs.dev/docs/manual-installation/react-router)
