export class OpenAPI3Parser {
  spec = { openapi: "" };
  parse(spec) {
    this.spec = spec;
    const schemas = spec.components?.schemas || {};
    let output = "";
    for (const [name, schema] of Object.entries(schemas)) {
      output += this.generateTopLevelDeclaration(name, schema);
    }
    return output;
  }
  generateTopLevelDeclaration(name, schema) {
    if (schema.enum && !schema.type) {
      // Top level enum without specific type (usually string)
      return this.generateEnum(name, schema);
    }
    if (schema.type === "string" && schema.enum) {
      return this.generateEnum(name, schema);
    }
    return `export type ${name} = ${this.resolveSchema(schema)};\n\n`;
  }
  generateEnum(name, schema) {
    const values = schema.enum;
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
  resolveSchema(schema) {
    if (!schema) return "any";
    if (schema.$ref) {
      return this.resolveRef(schema.$ref);
    }
    if (schema.allOf) {
      return schema.allOf.map((s) => this.resolveSchema(s)).join(" & ");
    }
    if (schema.oneOf || schema.anyOf) {
      const parts = (schema.oneOf || schema.anyOf).map((s) =>
        this.resolveSchema(s),
      );
      return parts.join(" | ");
    }
    let type;
    if (schema.enum) {
      return schema.enum.map((v) => JSON.stringify(v)).join(" | ");
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
  generateObject(schema) {
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
  resolveRef(ref) {
    if (ref.startsWith("#/components/schemas/")) {
      return ref.replace("#/components/schemas/", "");
    }
    return "any"; // Simplified for now
  }
}
