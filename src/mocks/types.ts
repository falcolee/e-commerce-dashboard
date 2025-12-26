export type SwaggerSchema =
  | SwaggerRefSchema
  | SwaggerObjectSchema
  | SwaggerArraySchema
  | SwaggerStringSchema
  | SwaggerNumberSchema
  | SwaggerIntegerSchema
  | SwaggerBooleanSchema
  | SwaggerAllOfSchema
  | SwaggerUnknownSchema;

export interface SwaggerRefSchema {
  $ref: string;
}

export interface SwaggerAllOfSchema {
  allOf: SwaggerSchema[];
}

export interface SwaggerObjectSchema {
  type: "object";
  properties?: Record<string, SwaggerSchema>;
  required?: string[];
  additionalProperties?: SwaggerSchema | boolean;
}

export interface SwaggerArraySchema {
  type: "array";
  items: SwaggerSchema;
  minItems?: number;
  maxItems?: number;
}

export interface SwaggerStringSchema {
  type: "string";
  enum?: string[];
  format?: string;
  default?: string;
  minLength?: number;
  maxLength?: number;
}

export interface SwaggerNumberSchema {
  type: "number";
  format?: string;
  minimum?: number;
  maximum?: number;
  default?: number;
}

export interface SwaggerIntegerSchema {
  type: "integer";
  format?: string;
  minimum?: number;
  maximum?: number;
  default?: number;
}

export interface SwaggerBooleanSchema {
  type: "boolean";
  default?: boolean;
}

export interface SwaggerUnknownSchema {
  type?: string;
  [key: string]: unknown;
}

export interface SwaggerParameter {
  name: string;
  in: "query" | "path" | "header" | "body" | "formData";
  required?: boolean;
  type?: string;
  schema?: SwaggerSchema;
}

export interface SwaggerResponse {
  schema?: SwaggerSchema;
}

export interface SwaggerOperation {
  parameters?: SwaggerParameter[];
  responses?: Record<string, SwaggerResponse>;
}

export interface MockSpec {
  basePath: string;
  paths: Record<string, Partial<Record<Lowercase<HttpMethod>, SwaggerOperation>>>;
  definitions: Record<string, SwaggerSchema>;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

