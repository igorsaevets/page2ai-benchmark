Biome is best installed as a development dependency of your projects, but it is also available as a [standalone executable](https://biomejs.dev/guides/manual-installation) that doesn’t require Node.js.

*   [npm](#tab-panel-492)
*   [pnpm](#tab-panel-493)
*   [bun](#tab-panel-494)
*   [deno](#tab-panel-495)
*   [yarn](#tab-panel-496)

```
npm i -D -E @biomejs/biome
```

Although Biome can run with zero configuration, you’ll likely want to tweak some settings to suit your project’s needs, in which case you can run the following command to generate a `biome.json` configuration file.

*   [npm](#tab-panel-497)
*   [pnpm](#tab-panel-498)
*   [bun](#tab-panel-499)
*   [deno](#tab-panel-500)
*   [yarn](#tab-panel-501)

```
npx @biomejs/biome init
```

Lets get a quick overview of how to use Biome in your project.

### Command-line interface

[Section titled “Command-line interface”](#command-line-interface)

Biome provides a [command-line interface](https://biomejs.dev/reference/cli) to format, lint, and check your code.

*   [npm](#tab-panel-502)
*   [pnpm](#tab-panel-503)
*   [bun](#tab-panel-504)
*   [deno](#tab-panel-505)
*   [yarn](#tab-panel-506)

```
# Format all filesnpx @biomejs/biome format --write# Format specific filesnpx @biomejs/biome format --write <files># Lint files and apply safe fixes to all filesnpx @biomejs/biome lint --write# Lint files and apply safe fixes to specific filesnpx @biomejs/biome lint --write <files># Format, lint, and organize imports of all filesnpx @biomejs/biome check --write# Format, lint, and organize imports of specific filesnpx @biomejs/biome check --write <files>
```

### Editor integrations

[Section titled “Editor integrations”](#editor-integrations)

Biome is available as a first-party extension in your favorite editors.

*   [VS Code](https://biomejs.dev/editors/first-party-extensions#vs-code)
*   [IntelliJ](https://biomejs.dev/editors/first-party-extensions#intellij)
*   [Zed](https://biomejs.dev/editors/first-party-extensions#zed)

There are also [community extensions](https://biomejs.dev/editors/third-party-extensions) for other editors, such as **Vim**, **Neovim**, and **Sublime Text**, to name a few.

### Continuous Integration

[Section titled “Continuous Integration”](#continuous-integration)

Run `biome ci` as part of your CI pipeline to enforce code quality and consistency across your team. It works just like the `biome check` command, but is optimized for CI environments.

*   [GitHub Actions](https://biomejs.dev/recipes/continuous-integration#github-actions)
*   [GitLab CI](https://biomejs.dev/recipes/continuous-integration#gitlab-ci)

See the [Continuous Integration](https://biomejs.dev/recipes/continuous-integration) recipes for more examples.

Success! You’re now ready to use Biome. 🥳

*   [Migrate from ESLint and Prettier](https://biomejs.dev/guides/migrate-eslint-prettier)
*   Learn more about how to [configure Biome](https://biomejs.dev/guides/configure-biome)
*   Learn more about how to use and configure the [formatter](https://biomejs.dev/formatter)
*   Learn more about how to use and configure the [linter](https://biomejs.dev/linter)
*   Get familiar with the [CLI commands and options](https://biomejs.dev/reference/cli)
*   Get familiar with the [configuration options](https://biomejs.dev/reference/configuration)
*   Join our [community on Discord](https://biomejs.dev/chat)

Copyright (c) 2023-present Biome Developers and Contributors.