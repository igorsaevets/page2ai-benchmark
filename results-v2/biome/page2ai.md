---
title: "Getting Started"
source: "https://biomejs.dev/guides/getting-started/"
captured_at: "2026-08-03T10:58:35.451Z"
language: "en"
description: "Learn how to set up a new project with Biome."
canonical: "https://biomejs.dev/guides/getting-started/"
extractor: "page2ai-core"
extractor_version: "0.1.5"
---

# Getting Started

# Getting Started

Biome is best installed as a development dependency of your projects, but it is also available as a [standalone executable](https://biomejs.dev/guides/manual-installation) that doesn’t require Node.js.

- [npm](https://biomejs.dev/guides/getting-started/#tab-panel-492)
- [pnpm](https://biomejs.dev/guides/getting-started/#tab-panel-493)
- [bun](https://biomejs.dev/guides/getting-started/#tab-panel-494)
- [deno](https://biomejs.dev/guides/getting-started/#tab-panel-495)
- [yarn](https://biomejs.dev/guides/getting-started/#tab-panel-496)

```bash
1npm i -D -E @biomejs/biome
```

```bash
1pnpm add -D -E @biomejs/biome
```

```bash
1bun add -D -E @biomejs/biome
```

```bash
1deno add -D npm:@biomejs/biome
```

```bash
1yarn add -D -E @biomejs/biome
```

`-E` ensures that the package manager pins the version of Biome. See the [versioning page](https://biomejs.dev/internals/versioning) for more information about [why pinning the version is important](https://biomejs.dev/internals/versioning#why-pinning-the-version-is-important) .

## Configuration

[Section titled “Configuration”](https://biomejs.dev/guides/getting-started/#configuration)

Although Biome can run with zero configuration, you’ll likely want to tweak some settings to suit your project’s needs, in which case you can run the following command to generate a `biome.json` configuration file.

- [npm](https://biomejs.dev/guides/getting-started/#tab-panel-497)
- [pnpm](https://biomejs.dev/guides/getting-started/#tab-panel-498)
- [bun](https://biomejs.dev/guides/getting-started/#tab-panel-499)
- [deno](https://biomejs.dev/guides/getting-started/#tab-panel-500)
- [yarn](https://biomejs.dev/guides/getting-started/#tab-panel-501)

```bash
1npx @biomejs/biome init
```

```bash
1pnpx @biomejs/biome init
```

```bash
1bunx --bun @biomejs/biome init
```

```bash
1deno run -A npm:@biomejs/biome init
```

```bash
1yarn exec biome -- init
```

## Usage

[Section titled “Usage”](https://biomejs.dev/guides/getting-started/#usage)

Lets get a quick overview of how to use Biome in your project.

### Command-line interface

[Section titled “Command-line interface”](https://biomejs.dev/guides/getting-started/#command-line-interface)

Biome provides a [command-line interface](https://biomejs.dev/reference/cli) to format, lint, and check your code.

- [npm](https://biomejs.dev/guides/getting-started/#tab-panel-502)
- [pnpm](https://biomejs.dev/guides/getting-started/#tab-panel-503)
- [bun](https://biomejs.dev/guides/getting-started/#tab-panel-504)
- [deno](https://biomejs.dev/guides/getting-started/#tab-panel-505)
- [yarn](https://biomejs.dev/guides/getting-started/#tab-panel-506)

```bash
1# Format all files2npx @biomejs/biome format --write3
4# Format specific files5npx @biomejs/biome format --write <files>6
7# Lint files and apply safe fixes to all files8npx @biomejs/biome lint --write9
10# Lint files and apply safe fixes to specific files11npx @biomejs/biome lint --write <files>12
13# Format, lint, and organize imports of all files14npx @biomejs/biome check --write15
16# Format, lint, and organize imports of specific files17npx @biomejs/biome check --write <files>
```

```bash
1# Format all files2pnpx @biomejs/biome format --write3
4# Format specific files5pnpx @biomejs/biome format --write <files>6
7# Lint and apply safe fixes to all files8pnpx @biomejs/biome lint --write9
10# Lint files and apply safe fixes to specific files11pnpx @biomejs/biome lint --write <files>12
13# Format, lint, and organize imports of all files14pnpx @biomejs/biome check --write15
16# Format, lint, and organize imports of specific files17pnpx @biomejs/biome check --write <files>
```

```bash
1# Format all files2bunx --bun @biomejs/biome format --write3
4# Format specific files5bunx --bun @biomejs/biome format --write <files>6
7# Lint and apply safe fixes to all files8bunx --bun @biomejs/biome lint --write9
10# Lint files and apply safe fixes to specific files11bunx --bun @biomejs/biome lint --write <files>12
13# Format, lint, and organize imports of all files14bunx --bun @biomejs/biome check --write15
16# Format, lint, and organize imports of specific files17bunx --bun @biomejs/biome check --write <files>
```

```bash
1# Format specific files2deno run -A npm:@biomejs/biome format --write <files>3
4# Format all files5deno run -A npm:@biomejs/biome format --write6
7# Lint files and apply safe fixes to all files8deno run -A npm:@biomejs/biome lint --write9
10# Lint files and apply safe fixes to specific files11deno run -A npm:@biomejs/biome lint --write <files>12
13# Format, lint, and organize imports of all files14deno run -A npm:@biomejs/biome check --write15
16# Format, lint, and organize imports of specific files17deno run -A npm:@biomejs/biome check --write <files>
```

```bash
1# Format all files2yarn exec biome format --write3
4# Format specific files5yarn exec biome format --write <files>6
7# Lint files and apply safe fixes to all files8yarn exec biome lint --write9
10# Lint files and apply safe fixes to specific files11yarn exec biome lint --write <files>12
13# Format, lint, and organize imports of all files14yarn exec biome check --write15
16# Format, lint, and organize imports of specific files17yarn exec biome check --write <files>
```

### Editor integrations

[Section titled “Editor integrations”](https://biomejs.dev/guides/getting-started/#editor-integrations)

Biome is available as a first-party extension in your favorite editors.

- [VS Code](https://biomejs.dev/editors/first-party-extensions#vs-code)
- [IntelliJ](https://biomejs.dev/editors/first-party-extensions#intellij)
- [Zed](https://biomejs.dev/editors/first-party-extensions#zed)

There are also [community extensions](https://biomejs.dev/editors/third-party-extensions) for other editors, such as **Vim** , **Neovim** , and **Sublime Text** , to name a few.

### Continuous Integration

[Section titled “Continuous Integration”](https://biomejs.dev/guides/getting-started/#continuous-integration)

Run `biome ci` as part of your CI pipeline to enforce code quality and consistency across your team. It works just like the `biome check` command, but is optimized for CI environments.

- [GitHub Actions](https://biomejs.dev/recipes/continuous-integration#github-actions)
- [GitLab CI](https://biomejs.dev/recipes/continuous-integration#gitlab-ci)

See the [Continuous Integration](https://biomejs.dev/recipes/continuous-integration) recipes for more examples.

## Next Steps

[Section titled “Next Steps”](https://biomejs.dev/guides/getting-started/#next-steps)

Success! You’re now ready to use Biome. 🥳

- [Migrate from ESLint and Prettier](https://biomejs.dev/guides/migrate-eslint-prettier)
- Learn more about how to [configure Biome](https://biomejs.dev/guides/configure-biome)
- Learn more about how to use and configure the [formatter](https://biomejs.dev/formatter)
- Learn more about how to use and configure the [linter](https://biomejs.dev/linter)
- Get familiar with the [CLI commands and options](https://biomejs.dev/reference/cli)
- Get familiar with the [configuration options](https://biomejs.dev/reference/configuration)
- Join our [community on Discord](https://biomejs.dev/chat)
[Edit page](https://github.com/biomejs/website/edit/main/src/content/docs/guides/getting-started.mdx)
[Next Manual installation](https://biomejs.dev/guides/manual-installation)

Sponsored by

![Depot](https://biomejs.dev/_astro/depot-logo-horizontal-on-light@3x.CwT7__a0_Z1e37Wx.webp?dpl=6a689b2f7419a4000834cf28)
![Depot](https://biomejs.dev/_astro/depot-logo-horizontal-on-dark@3x.BWjsBfKV_Z10ebDA.webp?dpl=6a689b2f7419a4000834cf28)

Copyright (c) 2023-present Biome Developers and Contributors.
