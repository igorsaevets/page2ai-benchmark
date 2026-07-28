## Prerequisite

Before continuing, make sure you have configured:

*   Next.js 16.
*   Tailwind CSS 4.

We will use [Fumadocs MDX](https://www.fumadocs.dev/docs/mdx) as a content source, you can configure it first:

### Installation

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

### Integrate with Fumadocs

You can create a `lib/source.ts` file and obtain Fumadocs source from the `docs` collection output.

```
import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});
```

The `.source` folder will be generated when you run `next dev` or `next build`.

### Done

You can now write content in `content/docs` folder.

Good to Know

## Getting Started

```
npm i fumadocs-ui fumadocs-core
```

### Root Layout

Wrap the entire application inside [Root Provider](https://www.fumadocs.dev/docs/ui/layouts/root-provider), and add required styles to `body`.

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

### Styles

Add the following Tailwind CSS styles to `global.css`.

```
@import 'tailwindcss';
@import 'fumadocs-ui/css/neutral.css';
@import 'fumadocs-ui/css/preset.css';
```

### Routes

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

### Finish

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