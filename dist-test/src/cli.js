#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { parse } from "yaml";
import { generateTypes } from "./index.js";
function main() {
  const args = process.argv.slice(2);
  const inputIndex = args.indexOf("-i");
  const outputIndex = args.indexOf("-o");
  if (
    inputIndex === -1 ||
    outputIndex === -1 ||
    !args[inputIndex + 1] ||
    !args[outputIndex + 1]
  ) {
    console.error(
      "Usage: npx openapi-ts-schema -i ./api.yaml -o ./src/types/api-types.ts",
    );
    process.exit(1);
  }
  const inputPath = args[inputIndex + 1];
  const outputPath = args[outputIndex + 1];
  try {
    const fileContent = readFileSync(inputPath, "utf8");
    let spec;
    if (inputPath.endsWith(".yaml") || inputPath.endsWith(".yml")) {
      spec = parse(fileContent);
    } else {
      spec = JSON.parse(fileContent);
    }
    const types = generateTypes(spec);
    writeFileSync(outputPath, types, "utf8");
    console.log(`Successfully generated types to ${outputPath}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
main();
