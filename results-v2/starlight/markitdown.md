[Skip to content](#_top)

[![](/_astro/logo-dark.IHkm-Unx.svg)![](/_astro/logo-light.BTLa6bQG.svg)Starlight](/)

Search`CtrlK`

Cancel

[GitHub](https://github.com/withastro/starlight)[Discord](https://astro.build/chat)

Select themeDarkLightAuto
Select languageEnglishDeutschEspañol日本語FrançaisItalianoBahasa Indonesia简体中文Português do BrasilPortuguês한국어TürkçeРусскийहिंदीDanskУкраїнськаفارسی

* Start Here
  + [Getting Started](/getting-started/)
  + [Manual Setup](/manual-setup/)
  + [Environmental Impact](/environmental-impact/)
* Guides
  + [Pages](/guides/pages/)
  + [Authoring Content in Markdown](/guides/authoring-content/)
  + [CSS & Styling](/guides/css-and-tailwind/)
  + [Customizing Starlight](/guides/customization/)
  + [Internationalization (i18n)](/guides/i18n/)
  + [Overriding Components](/guides/overriding-components/)
  + [Project Structure](/guides/project-structure/)
  + [Route Data](/guides/route-data/)
  + [Sidebar Navigation](/guides/sidebar/)
  + [Site Search](/guides/site-search/)
* Components
  + [Using Components](/components/using-components/)
  + [Cards](/components/cards/)
  + [Link Cards](/components/link-cards/)
  + [Card Grids](/components/card-grids/)
  + [Asides](/components/asides/)
  + [Badges](/components/badges/)
  + [Code](/components/code/)
  + [File Tree](/components/file-tree/)
  + [Icons](/components/icons/)
  + [Link Buttons](/components/link-buttons/)
  + [Steps](/components/steps/)
  + [Tabs](/components/tabs/)
* Reference
  + [Configuration Reference](/reference/configuration/)
  + [Frontmatter Reference](/reference/frontmatter/)
  + [Icons Reference](/reference/icons/)
  + [Overrides Reference](/reference/overrides/)
  + [Plugins Reference](/reference/plugins/)
  + [Route Data Reference](/reference/route-data/)
* Resources
  + [Plugins and Integrations](/resources/plugins/)
  + [Themes](/resources/themes/)
  + [Community Content](/resources/community-content/)
  + [Site Showcase](/resources/showcase/)

[GitHub](https://github.com/withastro/starlight)[Discord](https://astro.build/chat)

Select themeDarkLightAuto
Select languageEnglishDeutschEspañol日本語FrançaisItalianoBahasa Indonesia简体中文Português do BrasilPortuguês한국어TürkçeРусскийहिंदीDanskУкраїнськаفارسی

On this page

* [Overview](#_top)
* [Quick Start](#quick-start)
  + [Create a new project](#create-a-new-project)
  + [Start the development server](#start-the-development-server)
  + [Add content](#add-content)
  + [Next steps](#next-steps)
* [Updating Starlight](#updating-starlight)
* [Troubleshooting Starlight](#troubleshooting-starlight)

## On this page

* [Overview](#_top)
* [Quick Start](#quick-start)
  + [Create a new project](#create-a-new-project)
  + [Start the development server](#start-the-development-server)
  + [Add content](#add-content)
  + [Next steps](#next-steps)
* [Updating Starlight](#updating-starlight)
* [Troubleshooting Starlight](#troubleshooting-starlight)

# Getting Started

Starlight is a full-featured documentation theme built on top of the [Astro](https://astro.build) framework.
This guide will help you get started with a new project.
See the [manual setup instructions](/manual-setup/) to add Starlight to an existing Astro project.

## Quick Start

[Section titled “Quick Start”](#quick-start)

### Create a new project

[Section titled “Create a new project”](#create-a-new-project)

Create a new Astro + Starlight project by running the following command in your terminal:

* [npm](#tab-panel-407)
* [pnpm](#tab-panel-408)
* [Yarn](#tab-panel-409)

Terminal window

```
npm create astro@latest -- --template starlight
```

Terminal window

```
pnpm create astro --template starlight
```

Terminal window

```
yarn create astro --template starlight
```

This will create a new [project directory](/guides/project-structure/) with all the necessary files and configurations for your site.

See it in action

Try Starlight in your browser:
[open the template on StackBlitz](https://stackblitz.com/github/withastro/starlight/tree/main/examples/basics).

### Start the development server

[Section titled “Start the development server”](#start-the-development-server)

When working locally, [Astro’s development server](https://docs.astro.build/en/reference/cli-reference/#astro-dev) lets you preview your work and automatically refreshes your browser when you make changes.

Inside your project directory, run the following command to start the development server:

* [npm](#tab-panel-410)
* [pnpm](#tab-panel-411)
* [Yarn](#tab-panel-412)

Terminal window

```
npm run dev
```

Terminal window

```
pnpm dev
```

Terminal window

```
yarn dev
```

This will log a message to your terminal with the URL of your local preview.
Open this URL to start browsing your site.

### Add content

[Section titled “Add content”](#add-content)

Starlight is ready for you to add new content, or bring your existing files!

Add new pages to your site by creating Markdown files in the `src/content/docs/` directory.

Read more about file-based routing and support for MDX and Markdoc files in the [“Pages”](/guides/pages/) guide.

### Next steps

[Section titled “Next steps”](#next-steps)

* **Configure:** Learn about common options in [“Customizing Starlight”](/guides/customization/).
* **Navigate:** Set up your sidebar with the [“Sidebar Navigation”](/guides/sidebar/) guide.
* **Components:** Discover built-in cards, tabs, and more in the [“Components”](/components/using-components/) guide.
* **Extend:** Explore community add-ons in our [“Plugins”](/resources/plugins/) and [“Themes”](/resources/themes/) catalogs.
* **Deploy:** Publish your work with the [“Deploy your site”](https://docs.astro.build/en/guides/deploy/) guide in the Astro docs.

## Updating Starlight

[Section titled “Updating Starlight”](#updating-starlight)

Tip

Because Starlight is beta software, there will be frequent updates and improvements.
Be sure to update Starlight regularly!

Starlight is an Astro integration. You can update it and other Astro packages by running the following command in your terminal:

* [npm](#tab-panel-413)
* [pnpm](#tab-panel-414)
* [Yarn](#tab-panel-415)

Terminal window

```
npx @astrojs/upgrade
```

Terminal window

```
pnpm dlx @astrojs/upgrade
```

Terminal window

```
yarn dlx @astrojs/upgrade
```

See the [Starlight changelog](https://github.com/withastro/starlight/blob/main/packages/starlight/CHANGELOG.md) for a full list of the changes made in each release.

## Troubleshooting Starlight

[Section titled “Troubleshooting Starlight”](#troubleshooting-starlight)

Use the [project configuration](/reference/configuration/) and [individual page frontmatter configuration](/reference/frontmatter/) reference pages to ensure that your Starlight site is configured and functioning properly.
See the guides in the sidebar for help adding content and customizing your Starlight site.

If your answer cannot be found in these docs, please visit the [full Astro Docs](https://docs.astro.build) for complete Astro documentation.
Your question may be answered by understanding how Astro works in general, underneath this Starlight theme.

You can also check for any known [Starlight issues on GitHub](https://github.com/withastro/starlight/issues), and get help in the [Astro Discord](https://astro.build/chat/) from our active, friendly community! Post questions in our `#support` forum with the “starlight” tag, or visit our dedicated `#starlight` channel to discuss current development and more!

[Edit page](https://github.com/withastro/starlight/edit/main/docs/src/content/docs/getting-started.mdx)

Last updated: Oct 15, 2025

[Next
Manual Setup](/manual-setup/)