# Case Converter for Devs

A zero-dependency, single-file case converter for developers.
**No framework. No CDN. No build step. ~2 KB.**

![demo](https://img.shields.io/badge/size-~2KB-brightgreen) ![deps](https://img.shields.io/badge/dependencies-0-blue) ![framework](https://img.shields.io/badge/framework-none-lightgrey)

## Supported Formats

| Format | Example | Use Case |
|--------|---------|----------|
| `camelCase` | `myVariableName` | JavaScript / TypeScript |
| `PascalCase` | `MyVariableName` | React components / Classes |
| `snake_case` | `my_variable_name` | Python / Ruby |
| `kebab-case` | `my-variable-name` | CSS / URLs |
| `SCREAMING_SNAKE_CASE` | `MY_VARIABLE_NAME` | Constants |

## Features

- **Auto-detect** input format on every keystroke
- **Convert to all formats simultaneously** in real time
- **One-click copy** to clipboard with visual feedback
- Handles compound words correctly — e.g. `HTTPSRequest` → `https-request`, `HTTPS_REQUEST`

## Usage

Just open `index.html` in any browser. No server required.

```sh
open index.html
```

Or host it anywhere — GitHub Pages, Netlify, etc.

## How It Works

Input is first tokenized into a word array regardless of the source format:

```
"myVariableName"  →  ["my", "variable", "name"]
"my-variable"     →  ["my", "variable"]
"MY_CONST"        →  ["my", "const"]
```

Then each format is generated from that array. This means any format can be converted to any other format without special-casing every combination.

## License

MIT
