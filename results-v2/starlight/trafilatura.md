# Getting Started

Starlight is a full-featured documentation theme built on top of the [Astro](https://astro.build) framework.
This guide will help you get started with a new project.
See the [manual setup instructions](https://starlight.astro.build/manual-setup/) to add Starlight to an existing Astro project.

## Quick Start

[Section titled “Quick Start”](https://starlight.astro.build#quick-start)

### Create a new project

[Section titled “Create a new project”](https://starlight.astro.build#create-a-new-project)

Create a new Astro + Starlight project by running the following command in your terminal:

`npm create astro@latest -- --template starlight``pnpm create astro --template starlight``yarn create astro --template starlight`This will create a new [project directory](https://starlight.astro.build/guides/project-structure/) with all the necessary files and configurations for your site.

### Start the development server

[Section titled “Start the development server”](https://starlight.astro.build#start-the-development-server)

When working locally, [Astro’s development server](https://docs.astro.build/en/reference/cli-reference/#astro-dev) lets you preview your work and automatically refreshes your browser when you make changes.

Inside your project directory, run the following command to start the development server:

`npm run dev``pnpm dev``yarn dev`This will log a message to your terminal with the URL of your local preview. Open this URL to start browsing your site.

### Add content

[Section titled “Add content”](https://starlight.astro.build#add-content)

Starlight is ready for you to add new content, or bring your existing files!

Add new pages to your site by creating Markdown files in the `src/content/docs/` directory.

Read more about file-based routing and support for MDX and Markdoc files in the [“Pages”](https://starlight.astro.build/guides/pages/) guide.

### Next steps

[Section titled “Next steps”](https://starlight.astro.build#next-steps)

- **Configure:**Learn about common options in- [“Customizing Starlight”](https://starlight.astro.build/guides/customization/).
- **Navigate:**Set up your sidebar with the- [“Sidebar Navigation”](https://starlight.astro.build/guides/sidebar/)guide.
- **Components:**Discover built-in cards, tabs, and more in the- [“Components”](https://starlight.astro.build/components/using-components/)guide.
- **Extend:**Explore community add-ons in our- [“Plugins”](https://starlight.astro.build/resources/plugins/)and- [“Themes”](https://starlight.astro.build/resources/themes/)catalogs.
- **Deploy:**Publish your work with the- [“Deploy your site”](https://docs.astro.build/en/guides/deploy/)guide in the Astro docs.

## Updating Starlight

[Section titled “Updating Starlight”](https://starlight.astro.build#updating-starlight)

Starlight is an Astro integration. You can update it and other Astro packages by running the following command in your terminal:

`npx @astrojs/upgrade``pnpm dlx @astrojs/upgrade``yarn dlx @astrojs/upgrade`See the [Starlight changelog](https://github.com/withastro/starlight/blob/main/packages/starlight/CHANGELOG.md) for a full list of the changes made in each release.

## Troubleshooting Starlight

[Section titled “Troubleshooting Starlight”](https://starlight.astro.build#troubleshooting-starlight)

Use the [project configuration](https://starlight.astro.build/reference/configuration/) and [individual page frontmatter configuration](https://starlight.astro.build/reference/frontmatter/) reference pages to ensure that your Starlight site is configured and functioning properly.
See the guides in the sidebar for help adding content and customizing your Starlight site.

If your answer cannot be found in these docs, please visit the [full Astro Docs](https://docs.astro.build) for complete Astro documentation.
Your question may be answered by understanding how Astro works in general, underneath this Starlight theme.

You can also check for any known [Starlight issues on GitHub](https://github.com/withastro/starlight/issues), and get help in the [Astro Discord](https://astro.build/chat/) from our active, friendly community! Post questions in our `#support` forum with the “starlight” tag, or visit our dedicated `#starlight` channel to discuss current development and more!