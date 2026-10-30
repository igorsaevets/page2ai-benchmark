[Skip to main content](#__docusaurus_skipToContent_fallback)

🎉️ **[Docusaurus v3.10](https://docusaurus.io/blog/releases/3.10) is out!** 🥳️

[![](/img/docusaurus.svg)![](/img/docusaurus_keytar.svg)

**Docusaurus**](/)[Docs](/docs)[API](/docs/cli)[Blog](/blog)[Showcase](/showcase)[Community](/community/support)

[3.10.2](/docs)

* [Canary 🚧](/docs/next)* [3.10.2](/docs)* [3.9.2](/docs/3.9.2)* [3.8.1](/docs/3.8.1)* [3.7.0](/docs/3.7.0)* [3.6.3](/docs/3.6.3)* [3.5.2](/docs/3.5.2)* [3.4.0](/docs/3.4.0)* [3.3.2](/docs/3.3.2)* [3.2.1](/docs/3.2.1)* [3.1.1](/docs/3.1.1)* [3.0.1](/docs/3.0.1)* [2.x](/docs/2.x)* ---

                            * **Archived versions*** [2.3.1](https://docusaurus-archive-october-2023.netlify.app/docs/2.3.1)* [2.2.0](https://docusaurus-archive-october-2023.netlify.app/docs/2.2.0)* [2.1.0](https://docusaurus-archive-october-2023.netlify.app/docs/2.1.0)* [2.0.1](https://docusaurus-archive-october-2023.netlify.app/docs/2.0.1)* [1.x.x](https://v1.docusaurus.io)* ---

                                          * [All versions](/versions)

English

* [English](/docs)* [Français](/fr/docs)* [Português (Brasil)](/pt-BR/docs)* [한국어](/ko/docs)* [中文（中国）](/zh-CN/docs)* ---

            * [Help Us Translate](https://github.com/facebook/docusaurus/issues/3526)

Search

[![](/img/docusaurus.svg)![](/img/docusaurus_keytar.svg)**Docusaurus**](/)

* [Introduction](/docs)* [Getting Started](/docs/category/getting-started)

    + [Installation](/docs/installation)+ [Configuration](/docs/configuration)+ [Playground](/docs/playground)+ [TypeScript Support](/docs/typescript-support)* [Guides](/docs/category/guides)

      * [Advanced Guides](/docs/advanced)

        * [Upgrading](/docs/migration)

* * Introduction
Version: 3.10.2

On this page

# Introduction

⚡️ Docusaurus will help you ship a **beautiful documentation site in no time**.

💸 Building a custom tech stack is expensive. Instead, **focus on your content** and just write Markdown files.

💥 Ready for more? Use **advanced features** like versioning, i18n, search and theme customizations.

💅 Check the **[best Docusaurus sites](/showcase?tags=favorite)** for inspiration.

🧐 Docusaurus is a **static-site generator**. It builds a **single-page application** with fast client-side navigation, leveraging the full power of **React** to make your site interactive. It provides out-of-the-box **documentation features** but can be used to create **any kind of site** (personal website, product, blog, marketing landing pages, etc).

![](/assets/images/slash-introducing-411a16dd05086935b8e9ddae38ae9b45.svg)

## Fast Track ⏱️[​](#fast-track "Direct link to Fast Track ⏱️")

Understand Docusaurus in **5 minutes** by playing!

Create a new Docusaurus site and follow the **very short** embedded tutorial.

Install [Node.js](https://nodejs.org/en/download/) and create a new Docusaurus site:

```
npx create-docusaurus@latest my-website classic
```

Start the site:

```
cd my-website

npx docusaurus start
```

Open [`http://localhost:3000`](http://localhost:3000) and follow the tutorial.

tip

Use **[docusaurus.new](https://docusaurus.new)** to test Docusaurus immediately in your browser!

Or read the **[5-minute tutorial](https://tutorial.docusaurus.io)** online.

## Docusaurus: Documentation Made Easy[​](#docusaurus-documentation-made-easy "Direct link to Docusaurus: Documentation Made Easy")

In this presentation at [Algolia Community Event](https://www.algolia.com/), [Meta Open Source team](https://opensource.facebook.com/) shared a brief walk-through of Docusaurus. They covered how to get started with the project, enable plugins, and set up functionalities like documentation and blogging.

[Watch "Docusaurus: Documentation Made Easy" on YouTube](https://www.youtube.com/watch?v=Yhyx7otSksg)

Watch

## Migrating from v1[​](#migrating-from-v1 "Direct link to Migrating from v1")

Docusaurus v2+ has been a total rewrite from Docusaurus v1, taking advantage of a completely modernized toolchain. After [v2's official release](https://docusaurus.io/blog/2022/08/01/announcing-docusaurus-2.0), we highly encourage you to **use Docusaurus v2+ over Docusaurus v1**, as Docusaurus v1 has been deprecated.

A [lot of users](/showcase) are already using Docusaurus v2+ ([trends](https://www.npmtrends.com/docusaurus-vs-%40docusaurus/core)).

**Use Docusaurus v2+ if:**

* ✅ You want a modern Jamstack documentation site
* ✅ You want a single-page application (SPA) with client-side routing
* ✅ You want the full power of React and MDX
* ✅ You do not need support for IE11

**Use [Docusaurus v1](https://v1.docusaurus.io/) if:**

* ❌ You don't want a single-page application (SPA)
* ❌ You need support for IE11 (...do you? IE [has already reached end-of-life](https://docs.microsoft.com/en-us/lifecycle/products/internet-explorer-11) and is no longer officially supported)

For existing v1 users that are seeking to upgrade to v2+, you can follow our [migration guides](/docs/migration).

## Features[​](#features "Direct link to Features")

Docusaurus is built with high attention to the developer and contributor experience.

* ⚛️ **Built with 💚 and React**:
  + Extend and customize with React
  + Gain full control of your site's browsing experience by providing your own React components
* 🔌 **Pluggable**:
  + Bootstrap your site with a basic template, then use advanced features and plugins
  + Open source your plugins to share with the community
* ✂️ **Developer experience**:
  + Start writing your docs right now
  + Universal configuration entry point to make it more maintainable by contributors
  + Hot reloading with lightning-fast incremental build on changes
  + Route-based code and data splitting
  + Publish to GitHub Pages, Netlify, Vercel, and other deployment services with ease

Our shared goal—to help your users quickly find what they need and understand your products better. We share our best practices to help you build your docs site right and well.

* 🎯 **SEO friendly**:
  + HTML files are statically generated for every possible path.
  + Page-specific SEO to help your users land on your official docs directly relating their problems at hand.
* 📝 **Powered by MDX**:
  + Write interactive components via JSX and React embedded in Markdown.
  + Share your code in live editors to get your users to love your products on the spot.
* 🔍 **Search**: Your full site is searchable.
* 💾 **Document Versioning**: Helps you keep documentation in sync with project releases.
* 🌍 **Internationalization (i18n)**: Translate your site in multiple locales.

Docusaurus v2+ is born to be compassionately accessible to all your users, and lightning-fast.

* ⚡️ **Lightning-fast**. Docusaurus v2+ follows the [PRPL Pattern](https://developers.google.com/web/fundamentals/performance/prpl-pattern/) that makes sure your content loads blazing fast.
* 🦖 **Accessible**. Attention to accessibility, making your site equally accessible to all users.

## Design principles[​](#design-principles "Direct link to Design principles")

* **Little to learn**. Docusaurus should be easy to learn and use as the API is quite small. Most things will still be achievable by users, even if it takes them more code and more time to write. Not having abstractions is better than having the wrong abstractions, and we don't want users to have to hack around the wrong abstractions. Mandatory talk—[Minimal API Surface Area](https://www.youtube.com/watch?v=4anAwXYqLG8).
* **Intuitive**. Users will not feel overwhelmed when looking at the project directory of a Docusaurus project or adding new features. It should look intuitive and easy to build on top of, using approaches they are familiar with.
* **Layered architecture**. The separations of concerns between each layer of our stack (content/theming/styling) should be clear—well-abstracted and modular.
* **Sensible defaults**. Common and popular performance optimizations and configurations will be done for users but they are given the option to override them.
* **No vendor lock-in**. Users are not required to use the default plugins or CSS, although they are highly encouraged to. Certain core infrastructures like React Loadable and React Router cannot be swapped because we do default performance optimization on them, but not higher-level ones. Choice of Markdown engines, CSS frameworks, CSS methodology, and other architectures will be entirely up to users.

We believe that, as developers, knowing how a library works helps us become better at using it. Hence we're dedicating effort to explaining the architecture and various components of Docusaurus with the hope that users reading it will gain a deeper understanding of the tool and be even more proficient in using it.

## Comparison with other tools[​](#comparison-with-other-tools "Direct link to Comparison with other tools")

Across all static site generators, Docusaurus has a unique focus on documentation sites and has many out-of-the-box features.

We've also studied other main static site generators and would like to share our insights on the comparison, hopefully helping you navigate through the prismatic choices out there.

### Gatsby[​](#gatsby "Direct link to Gatsby")

[Gatsby](https://www.gatsbyjs.com/) is packed with a lot of features, has a rich ecosystem of plugins, and is capable of doing everything that Docusaurus does. Naturally, that comes at a cost of a higher learning curve. Gatsby does many things well and is suitable for building many types of websites. On the other hand, Docusaurus tries to do one thing super well - be the best tool for writing and publishing content.

GraphQL is also pretty core to Gatsby, although you don't necessarily need GraphQL to build a Gatsby site. In most cases when building static websites, you won't need the flexibility that GraphQL provides.

Many aspects of Docusaurus v2+ were inspired by the best things about Gatsby and it's a great alternative.

[Docz](https://github.com/pedronauck/docz) is a Gatsby theme to build documentation websites. It is currently less featured than Docusaurus.

### Next.js[​](#nextjs "Direct link to Next.js")

[Next.js](https://nextjs.org/) is another very popular hybrid React framework. It can help you build a good documentation website, but it is not opinionated toward the documentation use-case, and it will require a lot more work to implement what Docusaurus provides out-of-the-box.

[Nextra](https://github.com/shuding/nextra) is an opinionated static site generator built on top of Next.js. It is currently less featured than Docusaurus.

### VitePress[​](#vitepress "Direct link to VitePress")

[VitePress](https://vitepress.dev/) has many similarities with Docusaurus - both focus heavily on content-centric websites and provides tailored documentation features out of the box. However, VitePress is powered by Vue, while Docusaurus is powered by React. If you want a Vue-based solution, VitePress would be a decent choice.

### MkDocs[​](#mkdocs "Direct link to MkDocs")

[MkDocs](https://www.mkdocs.org/) is a popular Python static site generator with value propositions similar to Docusaurus.

It is a good option if you don't need a single-page application and don't plan to leverage React.

[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) is a beautiful theme.

### Docsify[​](#docsify "Direct link to Docsify")

[Docsify](https://docsify.js.org/) makes it easy to create a documentation website, but is not a static-site generator and is not SEO friendly.

### GitBook[​](#gitbook "Direct link to GitBook")

[GitBook](https://www.gitbook.com/) has a very clean design and has been used by many open source projects. With its focus shifting towards a commercial product rather than an open-source tool, many of its requirements no longer fit the needs of open source projects' documentation sites. As a result, many have turned to other products. You may read about Redux's switch to Docusaurus [here](https://github.com/reduxjs/redux/issues/3161).

Currently, GitBook is only free for open-source and non-profit teams. Docusaurus is free for everyone.

### Jekyll[​](#jekyll "Direct link to Jekyll")

[Jekyll](https://github.com/jekyll/jekyll) is one of the most mature static site generators around and has been a great tool to use — in fact, before Docusaurus, most of Facebook's Open Source websites are/were built on Jekyll! It is extremely simple to get started. We want to bring a similar developer experience as building a static site with Jekyll.

In comparison with statically generated HTML and interactivity added using `<script />` tags, Docusaurus sites are React apps. Using modern JavaScript ecosystem tooling, we hope to set new standards on doc sites' performance, asset building pipeline and optimizations, and ease to set up.

### Rspress[​](#rspress "Direct link to Rspress")

[Rspress](https://rspress.dev/) is a fast static site generator based on Rspack, a Rust-based bundler. It supports content writing with MDX (Markdown with React components), integrated text search, multilingual support (i18n), and extensibility through plugins. Designed for creating elegant documentation and static websites, Rspress produces static HTML files that are easy to deploy.

Rspress and Docusaurus are quite similar. They both have their pros and cons. Rspress was created more recently and benefits from a modern infrastructure that enables faster site builds. Docusaurus stands out for its maturity, comprehensive feature set, flexibility, and strong community. It is also [modernizing its infrastructure](https://github.com/facebook/docusaurus/issues/10556) regularly to remain competitive in terms of performance.

## Staying informed[​](#staying-informed "Direct link to Staying informed")

* [GitHub](https://github.com/facebook/docusaurus)
* [X](https://x.com/docusaurus)
* [Blog](/blog)
* [Discord](https://discord.gg/docusaurus)

## Something missing?[​](#something-missing "Direct link to Something missing?")

If you find issues with the documentation or have suggestions on how to improve the documentation or the project in general, please [file an issue](https://github.com/facebook/docusaurus) for us, or send a tweet mentioning the [@docusaurus](https://x.com/docusaurus) X account.

For new feature requests, you can create a post on our [feature requests board (Canny)](/feature-requests), which is a handy tool for road-mapping and allows for sorting by upvotes, which gives the core team a better indicator of what features are in high demand, as compared to GitHub issues which are harder to triage. Refrain from making a Pull Request for new features (especially large ones) as someone might already be working on it or will be part of our roadmap. Talk to us first!

[Edit this page](https://github.com/facebook/docusaurus/edit/main/website/docs/introduction.mdx)

Last updated on **Jul 10, 2026** by **Sébastien Lorber**

[Next

Getting Started](/docs/category/getting-started)

* [Fast Track ⏱️](#fast-track)* [Docusaurus: Documentation Made Easy](#docusaurus-documentation-made-easy)* [Migrating from v1](#migrating-from-v1)* [Features](#features)* [Design principles](#design-principles)* [Comparison with other tools](#comparison-with-other-tools)
            + [Gatsby](#gatsby)+ [Next.js](#nextjs)+ [VitePress](#vitepress)+ [MkDocs](#mkdocs)+ [Docsify](#docsify)+ [GitBook](#gitbook)+ [Jekyll](#jekyll)+ [Rspress](#rspress)* [Staying informed](#staying-informed)* [Something missing?](#something-missing)

Learn

* [Introduction](/docs)* [Installation](/docs/installation)* [Migration from v1 to v2](/docs/migration)

Community

* [Stack Overflow](https://stackoverflow.com/questions/tagged/docusaurus)* [Feature Requests](/feature-requests)* [Discord](https://discordapp.com/invite/docusaurus)* [Help](/community/support)

More

* [Blog](/blog)* [Changelog](/changelog)* [GitHub](https://github.com/facebook/docusaurus)* [X](https://x.com/docusaurus)* [![Deploys by Netlify](/img/footer/badge-netlify.svg)](https://www.netlify.com)* [![Covered by Argos](/img/footer/badge-argos.svg)](https://argos-ci.com)

Legal

* [Privacy](https://opensource.facebook.com/legal/privacy/)* [Terms](https://opensource.facebook.com/legal/terms/)* [Cookie Policy](https://opensource.facebook.com/legal/cookie-policy/)

[![Meta Open Source Logo](/img/meta_opensource_logo_negative.svg)![Meta Open Source Logo](/img/meta_opensource_logo_negative.svg)](https://opensource.fb.com)

Copyright © 2026 Meta Platforms, Inc. Built with Docusaurus.