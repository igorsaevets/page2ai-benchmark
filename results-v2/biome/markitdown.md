[Skip to content](#_top)

[![](/_astro/logo-dark-transparent.Bwi2A1en.svg) ![](/_astro/logo-light-transparent.D-4iVN_O.svg)  Biome](/)

[Docs](/guides/getting-started)  [Enterprise](/enterprise)  [Playground](/playground)

Search  `CtrlK`

Cancel

[Discord](https://biomejs.dev/chat)  [GitHub](https://github.com/biomejs/biome)  [Mastodon](https://fosstodon.org/%40biomejs)  [Open Collective](https://opencollective.com/biome)  [YouTube](https://youtube.com/%40Biomejs)  [BlueSky](https://bsky.app/profile/biomejs.dev)  [RSS](https://biomejs.dev/blog/rss.xml)

[Blog](/blog/)

  Select theme   DarkLightAuto         Select language   EnglishEspañolFrançais日本語简体中文PolskiPortuguêsУкраїнськаРусский        Version   v1.xv2.xnext

* [Blog](/blog/)
* [Playground](/playground)
* [Enterprise](/enterprise)
* Guides
  + [Getting Started](/guides/getting-started)
  + [Manual installation](/guides/manual-installation)
  + [Configure Biome](/guides/configure-biome)
  + [Use Biome in big projects](/guides/big-projects)
  + [Upgrade to Biome v2](/guides/upgrade-to-biome-v2)
  + [Integrate Biome with your VCS](/guides/integrate-in-vcs)
  + [Migrate from ESLint & Prettier](/guides/migrate-eslint-prettier)
  + [Investigate slowness](/guides/investigate-slowness)
* Formatter
  + [Introduction](/formatter)
  + [Differences with Prettier](/formatter/differences-with-prettier)
  + [Formatter Option Philosophy](/formatter/option-philosophy)
* Analyzer
  + [Suppressions](/analyzer/suppressions)
  + Linter
    - [Introduction](/linter)
    - [Domains](/linter/domains)
    - [Plugins](/linter/plugins)
    - [JavaScript Rules](/linter/javascript/rules)
    - [JavaScript Rules sources](/linter/javascript/sources)
    - [CSS Rules](/linter/css/rules)
    - [CSS Rules sources](/linter/css/sources)
    - [JSON Rules](/linter/json/rules)
    - [JSON Rules sources](/linter/json/sources)
    - [GraphQL Rules](/linter/graphql/rules)
    - [GraphQL Rules sources](/linter/graphql/sources)
    - [HTML Rules](/linter/html/rules)
    - [HTML Rules sources](/linter/html/sources)
  + Assist
    - [Introduction](/assist)
    - [JavaScript Actions](/assist/javascript/actions)
    - [JavaScript Actions sources](/assist/javascript/sources)
    - [CSS Actions](/assist/css/actions)
    - [CSS Actions sources](/assist/css/sources)
    - [JSON Actions](/assist/json/actions)
    - [JSON Actions sources](/assist/json/sources)
    - [GraphQL Actions](/assist/graphql/actions)
    - [GraphQL Actions sources](/assist/graphql/sources)
    - [HTML Actions](/assist/html/actions)
    - [HTML Actions sources](/assist/html/sources)
* Biome Language Server
  + [Introduction](/editors/introduction)
  + [First-party extensions](/editors/first-party-extensions)
  + [Third-party extensions](/editors/third-party-extensions)
* Reference
  + [CLI](/reference/cli)
  + [Diagnostics](/reference/diagnostics)
  + [Environment variables](/reference/environment-variables)
  + [Reporters](/reference/reporters)
  + [Configuration](/reference/configuration)
  + [VS Code extension](/reference/vscode)
  + [Zed extension](/reference/zed)
  + [GritQL](/reference/gritql)
  + [Daemon requests new](/reference/daemon)
* Recipes
  + [Continuous Integration](/recipes/continuous-integration)
  + [Git Hooks](/recipes/git-hooks)
  + [Renovate](/recipes/renovate)
  + [Social Badges](/recipes/badges)
  + [GritQL Plugin Recipes](/recipes/gritql-plugins)
* Internals
  + [Philosophy](/internals/philosophy)
  + [Language support](/internals/language-support)
  + [Architecture](/internals/architecture)
  + [People and Credits](/internals/people-and-credits)
  + [Versioning](/internals/versioning)
  + [Changelog](/internals/changelog/)
  + [Changelog v1](/internals/changelog_v1)

[Discord](https://biomejs.dev/chat)  [GitHub](https://github.com/biomejs/biome)  [Mastodon](https://fosstodon.org/%40biomejs)  [Open Collective](https://opencollective.com/biome)  [YouTube](https://youtube.com/%40Biomejs)  [BlueSky](https://bsky.app/profile/biomejs.dev)  [RSS](https://biomejs.dev/blog/rss.xml)

[Blog](/blog/)

  Select theme   DarkLightAuto        Select language   EnglishEspañolFrançais日本語简体中文PolskiPortuguêsУкраїнськаРусский       Version   v1.xv2.xnext

On this page

* [Overview](#_top)
* [Configuration](#configuration)
* [Usage](#usage)
  + [Command-line interface](#command-line-interface)
  + [Editor integrations](#editor-integrations)
  + [Continuous Integration](#continuous-integration)
* [Next Steps](#next-steps)

## On this page

* [Overview](#_top)
* [Configuration](#configuration)
* [Usage](#usage)
  + [Command-line interface](#command-line-interface)
  + [Editor integrations](#editor-integrations)
  + [Continuous Integration](#continuous-integration)
* [Next Steps](#next-steps)

# Getting Started

Biome is best installed as a development dependency of your projects, but it is
also available as a [standalone executable](/guides/manual-installation) that doesn’t require Node.js.

* [npm](#tab-panel-492)
* [pnpm](#tab-panel-493)
* [bun](#tab-panel-494)
* [deno](#tab-panel-495)
* [yarn](#tab-panel-496)

```
1

npm i -D -E @biomejs/biome
```

```
1

pnpm add -D -E @biomejs/biome
```

```
1

bun add -D -E @biomejs/biome
```

```
1

deno add -D npm:@biomejs/biome
```

```
1

yarn add -D -E @biomejs/biome
```

Version pinning

`-E` ensures that the package manager pins the version of Biome. See the
[versioning page](/internals/versioning)
for more information about [why pinning the version is important](/internals/versioning#why-pinning-the-version-is-important).

## Configuration

[Section titled “Configuration”](#configuration)

Although Biome can run with zero configuration, you’ll likely want to tweak some
settings to suit your project’s needs, in which case you can run the following
command to generate a `biome.json` configuration file.

* [npm](#tab-panel-497)
* [pnpm](#tab-panel-498)
* [bun](#tab-panel-499)
* [deno](#tab-panel-500)
* [yarn](#tab-panel-501)

```
1

npx @biomejs/biome init
```

```
1

pnpx @biomejs/biome init
```

```
1

bunx --bun @biomejs/biome init
```

```
1

deno run -A npm:@biomejs/biome init
```

```
1

yarn exec biome -- init
```

## Usage

[Section titled “Usage”](#usage)

Lets get a quick overview of how to use Biome in your project.

### Command-line interface

[Section titled “Command-line interface”](#command-line-interface)

Biome provides a [command-line interface](/reference/cli) to format, lint, and check your code.

* [npm](#tab-panel-502)
* [pnpm](#tab-panel-503)
* [bun](#tab-panel-504)
* [deno](#tab-panel-505)
* [yarn](#tab-panel-506)

```
1

# Format all files

2

npx @biomejs/biome format --write

3

4

# Format specific files

5

npx @biomejs/biome format --write <files>

6

7

# Lint files and apply safe fixes to all files

8

npx @biomejs/biome lint --write

9

10

# Lint files and apply safe fixes to specific files

11

npx @biomejs/biome lint --write <files>

12

13

# Format, lint, and organize imports of all files

14

npx @biomejs/biome check --write

15

16

# Format, lint, and organize imports of specific files

17

npx @biomejs/biome check --write <files>
```

```
1

# Format all files

2

pnpx @biomejs/biome format --write

3

4

# Format specific files

5

pnpx @biomejs/biome format --write <files>

6

7

# Lint and apply safe fixes to all files

8

pnpx @biomejs/biome lint --write

9

10

# Lint files and apply safe fixes to specific files

11

pnpx @biomejs/biome lint --write <files>

12

13

# Format, lint, and organize imports of all files

14

pnpx @biomejs/biome check --write

15

16

# Format, lint, and organize imports of specific files

17

pnpx @biomejs/biome check --write <files>
```

```
1

# Format all files

2

bunx --bun @biomejs/biome format --write

3

4

# Format specific files

5

bunx --bun @biomejs/biome format --write <files>

6

7

# Lint and apply safe fixes to all files

8

bunx --bun @biomejs/biome lint --write

9

10

# Lint files and apply safe fixes to specific files

11

bunx --bun @biomejs/biome lint --write <files>

12

13

# Format, lint, and organize imports of all files

14

bunx --bun @biomejs/biome check --write

15

16

# Format, lint, and organize imports of specific files

17

bunx --bun @biomejs/biome check --write <files>
```

```
1

# Format specific files

2

deno run -A npm:@biomejs/biome format --write <files>

3

4

# Format all files

5

deno run -A npm:@biomejs/biome format --write

6

7

# Lint files and apply safe fixes to all files

8

deno run -A npm:@biomejs/biome lint --write

9

10

# Lint files and apply safe fixes to specific files

11

deno run -A npm:@biomejs/biome lint --write <files>

12

13

# Format, lint, and organize imports of all files

14

deno run -A npm:@biomejs/biome check --write

15

16

# Format, lint, and organize imports of specific files

17

deno run -A npm:@biomejs/biome check --write <files>
```

```
1

# Format all files

2

yarn exec biome format --write

3

4

# Format specific files

5

yarn exec biome format --write <files>

6

7

# Lint files and apply safe fixes to all files

8

yarn exec biome lint --write

9

10

# Lint files and apply safe fixes to specific files

11

yarn exec biome lint --write <files>

12

13

# Format, lint, and organize imports of all files

14

yarn exec biome check --write

15

16

# Format, lint, and organize imports of specific files

17

yarn exec biome check --write <files>
```

### Editor integrations

[Section titled “Editor integrations”](#editor-integrations)

Biome is available as a first-party extension in your favorite editors.

* [VS Code](/editors/first-party-extensions#vs-code)
* [IntelliJ](/editors/first-party-extensions#intellij)
* [Zed](/editors/first-party-extensions#zed)

There are also [community extensions](/editors/third-party-extensions)
for other editors, such as **Vim**, **Neovim**, and **Sublime Text**, to name
a few.

### Continuous Integration

[Section titled “Continuous Integration”](#continuous-integration)

Run `biome ci` as part of your CI pipeline to enforce code quality and consistency
across your team. It works just like the `biome check` command, but is optimized for
CI environments.

* [GitHub Actions](/recipes/continuous-integration#github-actions)
* [GitLab CI](/recipes/continuous-integration#gitlab-ci)

See the [Continuous Integration](/recipes/continuous-integration) recipes for more examples.

## Next Steps

[Section titled “Next Steps”](#next-steps)

Success! You’re now ready to use Biome. 🥳

* [Migrate from ESLint and Prettier](/guides/migrate-eslint-prettier)
* Learn more about how to [configure Biome](/guides/configure-biome)
* Learn more about how to use and configure the [formatter](/formatter)
* Learn more about how to use and configure the [linter](/linter)
* Get familiar with the [CLI commands and options](/reference/cli)
* Get familiar with the [configuration options](/reference/configuration)
* Join our [community on Discord](https://biomejs.dev/chat)

[Edit page](https://github.com/biomejs/website/edit/main/src/content/docs/guides/getting-started.mdx)

[Next
 Manual installation](/guides/manual-installation)

Sponsored by

![Depot](/_astro/depot-logo-horizontal-on-light@3x.CwT7__a0_Z1e37Wx.webp?dpl=6a689b2f7419a4000834cf28) ![Depot](/_astro/depot-logo-horizontal-on-dark@3x.BWjsBfKV_Z10ebDA.webp?dpl=6a689b2f7419a4000834cf28)

Copyright (c) 2023-present Biome Developers and Contributors.