import { SchemaParser, OpenAPIV3Spec } from "../types.js";

export class OpenAPI3Parser implements SchemaParser {
  private spec: OpenAPIV3Spec = { openapi: "" };

  parse(spec: OpenAPIV3Spec): string {
    this.spec = spec;
    const schemas = spec.components?.schemas || {};
    let output = "";

    for (const [name, schema] of Object.entries(schemas)) {
      output += this.generateTopLevelDeclaration(name, schema);
    }

    return output;
  }

  private generateTopLevelDeclaration(name: string, schema: any): string {
    if (schema.enum && !schema.type) {
      // Top level enum without specific type (usually string)
      return this.generateEnum(name, schema);
    }

    if (schema.type === "string" && schema.enum) {
      return this.generateEnum(name, schema);
    }

    return `export type ${name} = ${this.resolveSchema(schema)};\n\n`;
  }

  private generateEnum(name: string, schema: any): string {
    const values = schema.enum as any[];
    let output = `export enum ${name} {\n`;
    for (const value of values) {
      const key =
        typeof value === "string"
          ? value.replace(/[^a-zA-Z0-9]/g, "_")
          : `VALUE_${value}`;
      output += `  ${key} = ${JSON.stringify(value)},\n`;
    }
    output += `}\n\n`;
    return output;
  }

  private resolveSchema(schema: any): string {
    if (!schema) return "any";

    if (schema.$ref) {
      return this.resolveRef(schema.$ref);
    }

    if (schema.allOf) {
      return schema.allOf.map((s: any) => this.resolveSchema(s)).join(" & ");
    }

    if (schema.oneOf || schema.anyOf) {
      const parts = (schema.oneOf || schema.anyOf).map((s: any) =>
        this.resolveSchema(s),
      );
      return parts.join(" | ");
    }

    let type: string;

    if (schema.enum) {
      return schema.enum.map((v: any) => JSON.stringify(v)).join(" | ");
    }

    switch (schema.type) {
      case "string":
        type = "string";
        break;
      case "number":
      case "integer":
        type = "number";
        break;
      case "boolean":
        type = "boolean";
        break;
      case "array":
        type = `${this.resolveSchema(schema.items)}[]`;
        break;
      case "object":
        type = this.generateObject(schema);
        break;
      default:
        type = "any";
    }

    if (schema.nullable) {
      type = `(${type} | null)`;
    }

    return type;
  }

  private generateObject(schema: any): string {
    const properties = schema.properties || {};
    const required = schema.required || [];
    const additionalProperties = schema.additionalProperties;

    let output = "{\n";
    for (const [propName, propSchema] of Object.entries(properties)) {
      const isRequired = required.includes(propName);
      output += `  ${propName}${isRequired ? "" : "?"}: ${this.resolveSchema(propSchema)};\n`;
    }

    if (additionalProperties) {
      const valueType =
        additionalProperties === true
          ? "any"
          : this.resolveSchema(additionalProperties);
      output += `  [key: string]: ${valueType};\n`;
    }

    output += "}";
    return output;
  }

  private resolveRef(ref: string): string {
    if (ref.startsWith("#/components/schemas/")) {
      return ref.replace("#/components/schemas/", "");
    }
    return "any"; // Simplified for now
  }
}
