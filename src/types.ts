export interface SchemaParser {
  parse(spec: any): string;
}

export type OpenAPIV3Spec = {
  openapi: string;
  components?: {
    schemas?: Record<string, any>;
  };
  [key: string]: any;
};
