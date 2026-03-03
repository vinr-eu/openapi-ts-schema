import { SchemaParser } from "./types.js";
import { OpenAPI3Parser } from "./parsers/OpenAPI3Parser.js";

export function getParser(spec: any): SchemaParser {
  const version = spec.openapi || spec.swagger;

  if (version && version.startsWith("3.")) {
    return new OpenAPI3Parser();
  }

  throw new Error(`Unsupported OpenAPI version: ${version}`);
}

export function generateTypes(spec: any): string {
  const parser = getParser(spec);
  return parser.parse(spec);
}
