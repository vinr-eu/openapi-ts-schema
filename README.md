# openapi-ts-schema

A lightweight, fast, and extensible OpenAPI 3 to TypeScript generator.

## Installation

```bash
npm install -g openapi-ts-schema
# or use it via npx
npx openapi-ts-schema -i ./api.yaml -o ./src/types/api-types.ts
```

## Programmatic Usage

You can also use the library programmatically in your TypeScript/JavaScript code:

```typescript
import { generateTypes } from "openapi-ts-schema";
import { readFileSync, writeFileSync } from "fs";
import { parse } from "yaml";

const spec = parse(readFileSync("./api.yaml", "utf8"));
const types = generateTypes(spec);
writeFileSync("./src/types.ts", types);
```

## Features

- **OpenAPI 3.x support**: Built for modern API specs.
- **Extensible**: Modular architecture with a generic parser interface.
- **Advanced conversions**:
  - `$ref` resolution (internal).
  - `allOf`, `oneOf`, `anyOf` compositions/unions.
  - Top-level `enum` to TypeScript `enum`.
  - Inline `enum` to TypeScript string literal unions.
  - Optional vs Required properties.
  - `additionalProperties` (dictionaries).
  - `nullable` support.
- **Fast and Lightweight**: Minimal dependencies.

## Usage in Bash Scripts

You can easily integrate it into your CI/CD pipelines or local development scripts:

```bash
#!/bin/bash

# Generate types from a YAML file
npx openapi-ts-schema -i ./specs/api.yaml -o ./src/generated/api.ts

# Format the generated file (optional)
npx prettier --write ./src/generated/api.ts
```

## CLI Options

- `-i`: Path to the input OpenAPI file (JSON or YAML).
- `-o`: Path to the output TypeScript file.

## Architecture

The project uses a `SchemaParser` interface and an `OpenAPI3Parser` implementation. A factory function identifies the OpenAPI version and routes it to the appropriate parser, making it easy to add support for future versions (3.1, 4.0, etc.).

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT

OpenAPI TypeScript generator
