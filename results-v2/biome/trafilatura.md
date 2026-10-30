# Getting Started

Biome is best installed as a development dependency of your projects, but it is
also available as a [standalone executable](https://biomejs.dev/guides/manual-installation) that doesn’t require Node.js.

`npm i -D -E @biomejs/biome``pnpm add -D -E @biomejs/biome``bun add -D -E @biomejs/biome``deno add -D npm:@biomejs/biome``yarn add -D -E @biomejs/biome`## Configuration

[Section titled “Configuration”](https://biomejs.dev#configuration)

Although Biome can run with zero configuration, you’ll likely want to tweak some
settings to suit your project’s needs, in which case you can run the following
command to generate a `biome.json` configuration file.

`npx @biomejs/biome init``pnpx @biomejs/biome init``bunx --bun @biomejs/biome init``deno run -A npm:@biomejs/biome init``yarn exec biome -- init`Lets get a quick overview of how to use Biome in your project.

### Command-line interface

[Section titled “Command-line interface”](https://biomejs.dev#command-line-interface)

Biome provides a [command-line interface](https://biomejs.dev/reference/cli) to format, lint, and check your code.

```
# Format all filesnpx @biomejs/biome format --write
# Format specific filesnpx @biomejs/biome format --write <files>
# Lint files and apply safe fixes to all filesnpx @biomejs/biome lint --write
# Lint files and apply safe fixes to specific filesnpx @biomejs/biome lint --write <files>
# Format, lint, and organize imports of all filesnpx @biomejs/biome check --write
# Format, lint, and organize imports of specific filesnpx @biomejs/biome check --write <files>
```
```
# Format all filespnpx @biomejs/biome format --write
# Format specific filespnpx @biomejs/biome format --write <files>
# Lint and apply safe fixes to all filespnpx @biomejs/biome lint --write
# Lint files and apply safe fixes to specific filespnpx @biomejs/biome lint --write <files>
# Format, lint, and organize imports of all filespnpx @biomejs/biome check --write
# Format, lint, and organize imports of specific filespnpx @biomejs/biome check --write <files>
```
```
# Format all filesbunx --bun @biomejs/biome format --write
# Format specific filesbunx --bun @biomejs/biome format --write <files>
# Lint and apply safe fixes to all filesbunx --bun @biomejs/biome lint --write
# Lint files and apply safe fixes to specific filesbunx --bun @biomejs/biome lint --write <files>
# Format, lint, and organize imports of all filesbunx --bun @biomejs/biome check --write
# Format, lint, and organize imports of specific filesbunx --bun @biomejs/biome check --write <files>
```
```
# Format specific filesdeno run -A npm:@biomejs/biome format --write <files>
# Format all filesdeno run -A npm:@biomejs/biome format --write
# Lint files and apply safe fixes to all filesdeno run -A npm:@biomejs/biome lint --write
# Lint files and apply safe fixes to specific filesdeno run -A npm:@biomejs/biome lint --write <files>
# Format, lint, and organize imports of all filesdeno run -A npm:@biomejs/biome check --write
# Format, lint, and organize imports of specific filesdeno run -A npm:@biomejs/biome check --write <files>
```
```
# Format all filesyarn exec biome format --write
# Format specific filesyarn exec biome format --write <files>
# Lint files and apply safe fixes to all filesyarn exec biome lint --write
# Lint files and apply safe fixes to specific filesyarn exec biome lint --write <files>
# Format, lint, and organize imports of all filesyarn exec biome check --write
# Format, lint, and organize imports of specific filesyarn exec biome check --write <files>
```
### Editor integrations

[Section titled “Editor integrations”](https://biomejs.dev#editor-integrations)

Biome is available as a first-party extension in your favorite editors.

There are also [community extensions](https://biomejs.dev/editors/third-party-extensions)
for other editors, such as **Vim**, **Neovim**, and **Sublime Text**, to name
a few.

### Continuous Integration

[Section titled “Continuous Integration”](https://biomejs.dev#continuous-integration)

Run `biome ci` as part of your CI pipeline to enforce code quality and consistency
across your team. It works just like the `biome check` command, but is optimized for
CI environments.

See the [Continuous Integration](https://biomejs.dev/recipes/continuous-integration) recipes for more examples.

## Next Steps

[Section titled “Next Steps”](https://biomejs.dev#next-steps)

Success! You’re now ready to use Biome. 🥳

- [Migrate from ESLint and Prettier](https://biomejs.dev/guides/migrate-eslint-prettier)
- Learn more about how to [configure Biome](https://biomejs.dev/guides/configure-biome)
- Learn more about how to use and configure the [formatter](https://biomejs.dev/formatter)
- Learn more about how to use and configure the [linter](https://biomejs.dev/linter)
- Get familiar with the [CLI commands and options](https://biomejs.dev/reference/cli)
- Get familiar with the [configuration options](https://biomejs.dev/reference/configuration)
- Join our [community on Discord](https://biomejs.dev/chat)

Copyright (c) 2023-present Biome Developers and Contributors.