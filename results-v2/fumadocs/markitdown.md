[![Fumadocs](/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.2-8hi7xjasgkd.png&w=3840&q=75)Fumadocs](/)

[![Fumadocs](/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.2-8hi7xjasgkd.png&w=3840&q=75)Fumadocs](/)

Search

`⌘``K`

Framework

The docs framework

Introduction

[Quick Start](/docs)[What is Fumadocs](/docs/what-is-fumadocs)[Comparisons](/docs/comparisons)

[Manual Installation](/docs/manual-installation)

[Astro](/docs/manual-installation/astro)[Next.js](/docs/manual-installation/next)[React Router](/docs/manual-installation/react-router)[Tanstack Start](/docs/manual-installation/tanstack-start)[Waku](/docs/manual-installation/waku)

[Guides](/docs/guides)

Writing

[Page Slugs & Page Tree](/docs/page-conventions)

[Markdown](/docs/markdown)

Configurations

[Navigation](/docs/navigation)

[Deploying](/docs/deploying)

[Internationalization](/docs/internationalization)

[Search](/docs/search)

Integrations

[Feedback](/docs/integrations/feedback)[AI & LLMs](/docs/integrations/llms)[Validate Links](/docs/integrations/validate-links)

Content Generators

[AsyncAPI](/docs/integrations/asyncapi)

[Content Source](/docs/integrations/content)

[OG Image Generation](/docs/integrations/og)

[OpenAPI](/docs/integrations/openapi)

[Story](/docs/integrations/story)

Next.js

[Manual Installation](/docs/manual-installation)

# Next.js

Setup Fumadocs on Next.js.

Copy MarkdownOpen

## [Prerequisite](#prerequisite)

Before continuing, make sure you have configured:

* Next.js 16.
* Tailwind CSS 4.

We will use [Fumadocs MDX](/docs/mdx) as a content source, you can configure it first:

### [Installation](#installation)

npmpnpmyarnbun

```
npm i fumadocs-mdx fumadocs-core @types/mdx
```

Create the configuration file:

source.config.ts

```
import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig();
```

Add the plugin to Next.js config:

next.config.mjs

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

Fumadocs MDX is ESM-only, it's recommended to use `next.config.mjs` for accurate ESM resolution.

For TypeScript config file, it requires Native Node.js TypeScript Resolver, you can see [Next.js docs](https://nextjs.org/docs/app/api-reference/config/typescript#using-nodejs-native-typescript-resolver-for-nextconfigts) for details.

Setup an import alias (recommended):

tsconfig.json

```
{
  "compilerOptions": {
    "paths": {
      "collections/*": ["./.source/*"]
    }
  }
}
```

### [Integrate with Fumadocs](#integrate-with-fumadocs)

You can create a `lib/source.ts` file and obtain Fumadocs source from the `docs` collection output.

lib/source.ts

```
import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});
```

The `.source` folder will be generated when you run `next dev` or `next build`.

### [Done](#done)

You can now write content in `content/docs` folder.

Good to Know

Fumadocs also supports other content sources, including [Content Collections](/docs/headless/content-collections) and headless CMS.

## [Getting Started](#getting-started)

npmpnpmyarnbun

```
npm i fumadocs-ui fumadocs-core
```

### [Root Layout](#root-layout)

Wrap the entire application inside [Root Provider](/docs/ui/layouts/root-provider), and add required styles to `body`.

app/layout.tsx

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

### [Styles](#styles)

Add the following Tailwind CSS styles to `global.css`.

global.css

```
@import 'tailwindcss';
@import 'fumadocs-ui/css/neutral.css';
@import 'fumadocs-ui/css/preset.css';
```

It doesn't come with a default font, you may choose one from `next/font`.

### [Routes](#routes)

Create a `lib/layout.shared.tsx` file to put the shared options for our layouts.

lib/layout.shared.tsx

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

components/mdx.tsxapp/docs/layout.tsxapp/docs/[[...slug]]/page.tsxapp/api/search/route.ts

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

The search is powered by Orama, learn more about [Document Search](/docs/headless/search).

### [Finish](#finish)

You can start the dev server and create MDX files.

content/docs/index.mdx

```
---
title: Hello World
---

## Introduction

I love Anime.
```

How is this guide?

GoodBad

Last updated on

[Astro

Setup Fumadocs on Astro with React islands.](/docs/manual-installation/astro)[React Router

Setup Fumadocs on React Router.](/docs/manual-installation/react-router)

### On this page

[Prerequisite](#prerequisite)[Installation](#installation)[Integrate with Fumadocs](#integrate-with-fumadocs)[Done](#done)[Getting Started](#getting-started)[Root Layout](#root-layout)[Styles](#styles)[Routes](#routes)[Finish](#finish)

Ask AI