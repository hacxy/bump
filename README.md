# @hacxy/bump

A CLI tool for automating version bumping, changelog generation, and package publishing.

## Features

- 🚀 **Interactive Version Bumping**: Select from patch, minor, major, beta, alpha, or custom version
- 📝 **Automatic Changelog Generation**: Generate changelog using conventional-changelog
- 🔨 **Build Support**: Optional build step before release
- 🏷️ **Git Integration**: Automatically commit, tag, and push changes
- 📦 **NPM Publishing**: Publish to npm with support for `latest` and `next` tags
- 🔄 **Error Recovery**: Automatic rollback on errors

## Requirements

- Node.js `^18.0.0 || >=20.0.0`
- Git (optional, for git operations)
- npm (for publishing)

## Install

```bash
npm install -g @hacxy/bump
```

Or use with `npx`:

```bash
npx @hacxy/bump
```

## Usage

Run the command in your project directory:

```bash
bump
```

The tool will guide you through an interactive process:

1. **Select release type**: Choose from patch, minor, major, beta, alpha, or enter a custom version
2. **Select tag type**: Choose `latest` or `next` for npm publishing
3. **Confirm release**: Review and confirm the release version
4. **Build (optional)**: Choose whether to run the build command from `package.json`
5. **Generate changelog (optional)**: Automatically generate `CHANGELOG.md` using conventional commits
6. **Git operations (optional)**: Commit changes, create git tag, and push to remote
7. **Publish to npm (optional)**: Publish the package to npm registry

## Workflow

The tool follows this workflow:

1. Updates `package.json` version
2. Optionally runs `npm run build`
3. Optionally generates `CHANGELOG.md`
4. Optionally commits changes with message: `chore: release: v{version}`
5. Optionally creates git tag: `v{version}`
6. Optionally pushes commits and tags to remote
7. Optionally publishes to npm with selected tag

## License

[MIT](./LICENSE)

## Author

**hacxy**

- Email: hacxy.js@outlook.com
- Website: https://hacxy.cn
