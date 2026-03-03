import { test } from "node:test";
import assert from "node:assert";
import { OpenAPI3Parser } from "../src/parsers/OpenAPI3Parser.js";
test("OpenAPI3Parser - basic object and properties", () => {
  const parser = new OpenAPI3Parser();
  const spec = {
    openapi: "3.0.0",
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string" },
          },
          required: ["id", "name"],
        },
      },
    },
  };
  const result = parser.parse(spec);
  assert.match(result, /export type User = {/);
  assert.match(result, /id: number;/);
  assert.match(result, /name: string;/);
  assert.match(result, /email\?: string;/);
});
test("OpenAPI3Parser - $ref resolution", () => {
  const parser = new OpenAPI3Parser();
  const spec = {
    openapi: "3.0.0",
    components: {
      schemas: {
        Pet: {
          type: "object",
          properties: {
            owner: { $ref: "#/components/schemas/User" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
          },
        },
      },
    },
  };
  const result = parser.parse(spec);
  assert.match(result, /owner\?: User;/);
});
test("OpenAPI3Parser - allOf composition", () => {
  const parser = new OpenAPI3Parser();
  const spec = {
    openapi: "3.0.0",
    components: {
      schemas: {
        ExtendedUser: {
          allOf: [
            { $ref: "#/components/schemas/User" },
            {
              type: "object",
              properties: {
                role: { type: "string" },
              },
            },
          ],
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
          },
        },
      },
    },
  };
  const result = parser.parse(spec);
  assert.match(result, /export type ExtendedUser = User & {/);
  assert.match(result, /role\?: string;/);
});
test("OpenAPI3Parser - oneOf / anyOf unions", () => {
  const parser = new OpenAPI3Parser();
  const spec = {
    openapi: "3.0.0",
    components: {
      schemas: {
        Response: {
          oneOf: [
            { $ref: "#/components/schemas/Success" },
            { $ref: "#/components/schemas/Error" },
          ],
        },
        Success: { type: "object", properties: { ok: { type: "boolean" } } },
        Error: { type: "object", properties: { message: { type: "string" } } },
      },
    },
  };
  const result = parser.parse(spec);
  assert.match(result, /export type Response = Success | Error;/);
});
test("OpenAPI3Parser - Top-level Enums", () => {
  const parser = new OpenAPI3Parser();
  const spec = {
    openapi: "3.0.0",
    components: {
      schemas: {
        Status: {
          type: "string",
          enum: ["active", "inactive", "pending"],
        },
      },
    },
  };
  const result = parser.parse(spec);
  assert.match(result, /export enum Status {/);
  assert.match(result, /active = "active"/);
  assert.match(result, /inactive = "inactive"/);
  assert.match(result, /pending = "pending"/);
});
test("OpenAPI3Parser - Inline Enums", () => {
  const parser = new OpenAPI3Parser();
  const spec = {
    openapi: "3.0.0",
    components: {
      schemas: {
        Task: {
          type: "object",
          properties: {
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
            },
          },
        },
      },
    },
  };
  const result = parser.parse(spec);
  assert.match(result, /priority\?: "low" | "medium" | "high";/);
});
test("OpenAPI3Parser - Dictionaries (additionalProperties)", () => {
  const parser = new OpenAPI3Parser();
  const spec = {
    openapi: "3.0.0",
    components: {
      schemas: {
        Config: {
          type: "object",
          additionalProperties: {
            type: "string",
          },
        },
      },
    },
  };
  const result = parser.parse(spec);
  assert.match(result, /\[key: string\]: string;/);
});
test("OpenAPI3Parser - Arrays", () => {
  const parser = new OpenAPI3Parser();
  const spec = {
    openapi: "3.0.0",
    components: {
      schemas: {
        UserList: {
          type: "array",
          items: { $ref: "#/components/schemas/User" },
        },
        User: { type: "object", properties: { id: { type: "integer" } } },
      },
    },
  };
  const result = parser.parse(spec);
  assert.match(result, /export type UserList = User\[\];/);
});
test("OpenAPI3Parser - Nullable", () => {
  const parser = new OpenAPI3Parser();
  const spec = {
    openapi: "3.0.0",
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            bio: { type: "string", nullable: true },
          },
        },
      },
    },
  };
  const result = parser.parse(spec);
  assert.match(result, /bio\?: \(string | null\);/);
});
