Biome is best installed as a development dependency of your projects, but it is also available as a [standalone executable](https://biomejs.dev/guides/manual-installation) that doesn’t require Node.js.

```bash
npm i -D -E @biomejs/biome
```

## Configuration

Although Biome can run with zero configuration, you’ll likely want to tweak some settings to suit your project’s needs, in which case you can run the following command to generate a `biome.json` configuration file.

```bash
npx @biomejs/biome init
```

## Usage

Lets get a quick overview of how to use Biome in your project.

### Command-line interface

Biome provides a [command-line interface](https://biomejs.dev/reference/cli) to format, lint, and check your code.

```bash
# Format all files
npx @biomejs/biome format --write

# Format specific files
npx @biomejs/biome format --write <files>

# Lint files and apply safe fixes to all files
npx @biomejs/biome lint --write

# Lint files and apply safe fixes to specific files
npx @biomejs/biome lint --write <files>

# Format, lint, and organize imports of all files
npx @biomejs/biome check --write

# Format, lint, and organize imports of specific files
npx @biomejs/biome check --write <files>
```

### Editor integrations

Biome is available as a first-party extension in your favorite editors.

*   [VS Code](https://biomejs.dev/editors/first-party-extensions#vs-code)
*   [IntelliJ](https://biomejs.dev/editors/first-party-extensions#intellij)
*   [Zed](https://biomejs.dev/editors/first-party-extensions#zed)

There are also [community extensions](https://biomejs.dev/editors/third-party-extensions) for other editors, such as **Vim**, **Neovim**, and **Sublime Text**, to name a few.

### Continuous Integration

Run `biome ci` as part of your CI pipeline to enforce code quality and consistency across your team. It works just like the `biome check` command, but is optimized for CI environments.

See the [Continuous Integration](https://biomejs.dev/recipes/continuous-integration) recipes for more examples.

## Next Steps

Success! You’re now ready to use Biome. 🥳

*   [Migrate from ESLint and Prettier](https://biomejs.dev/guides/migrate-eslint-prettier)
*   Learn more about how to [configure Biome](https://biomejs.dev/guides/configure-biome)
*   Learn more about how to use and configure the [formatter](https://biomejs.dev/formatter)
*   Learn more about how to use and configure the [linter](https://biomejs.dev/linter)
*   Get familiar with the [CLI commands and options](https://biomejs.dev/reference/cli)
*   Get familiar with the [configuration options](https://biomejs.dev/reference/configuration)
*   Join our [community on Discord](https://biomejs.dev/chat)