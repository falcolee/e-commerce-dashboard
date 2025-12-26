/* eslint-disable */
/* tslint:disable */

import type { MockSpec, SwaggerSchema } from "./types";
import type { Rng } from "./rng";

const REF_PREFIX = "#/definitions/";

export function resolveRefName(ref: string): string | null | undefined {
  if (!ref.startsWith(REF_PREFIX)) return null;
  return ref.slice(REF_PREFIX.length);
}

export function resolveSchema(
  spec: MockSpec,
  schema: SwaggerSchema,
): SwaggerSchema {
  if ("$ref" in schema) {
    // @ts-ignore
    const name = resolveRefName(schema.$ref);
    if (!name) return schema;
    return spec.definitions[name] ?? schema;
  }
  return schema;
}

export interface GenerateContext {
  spec: MockSpec;
  rng: Rng;
  depth: number;
  maxDepth: number;
  index: number;
  pathHint?: string;
}

export function generateFromSchema(
  schema: SwaggerSchema | undefined,
  ctx: GenerateContext,
): unknown {
  if (!schema) return null;
  if (ctx.depth > ctx.maxDepth) return null;

  const resolved = resolveSchema(ctx.spec, schema);

  if ("allOf" in resolved) {
    const merged: Record<string, unknown> = {};
    // @ts-ignore
    for (const part of resolved.allOf) {
      const value = generateFromSchema(part, { ...ctx, depth: ctx.depth + 1 });
      if (value && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(merged, value as Record<string, unknown>);
      }
    }
    return merged;
  }

  if ("type" in resolved) {
    switch (resolved.type) {
      case "string":
        return generateString(resolved as any, ctx);
      case "integer":
        return generateNumber(resolved as any, ctx, true);
      case "number":
        return generateNumber(resolved as any, ctx, false);
      case "boolean":
        return generateBoolean(resolved as any, ctx);
      case "array":
        return generateArray(resolved as any, ctx);
      case "object":
        return generateObject(resolved as any, ctx);
      default:
        return null;
    }
  }

  return null;
}

function generateString(
  schema: { enum?: string[]; format?: string; default?: string },
  ctx: GenerateContext,
): string {
  if (schema.default) return schema.default;
  if (schema.enum && schema.enum.length > 0)
    return schema.enum[ctx.index % schema.enum.length];

  const format = schema.format;
  if (format === "date-time")
    return new Date(1704067200000 + ctx.index * 60000).toISOString();
  if (format === "date")
    return new Date(1704067200000 + ctx.index * 86400000)
      .toISOString()
      .slice(0, 10);
  if (format === "email") return `user${ctx.index}@example.com`;
  if (format === "uri") return `https://example.com/${ctx.index}`;
  if (format === "uuid")
    return `00000000-0000-4000-8000-${String(ctx.index).padStart(12, "0")}`;

  const hint = ctx.pathHint ? ctx.pathHint.split(".").slice(-1)[0] : "value";
  return `Test ${hint} ${ctx.index}`;
}

function generateNumber(
  schema: { minimum?: number; maximum?: number; default?: number },
  ctx: GenerateContext,
  isInteger: boolean,
): number {
  if (schema.default !== undefined) return schema.default;

  const min = schema.minimum ?? (isInteger ? 0 : 0);
  const max = schema.maximum ?? (isInteger ? 1000 : 1000);
  const value = min + (max - min) * ctx.rng.next();
  return isInteger ? Math.round(value) : Number(value.toFixed(2));
}

function generateBoolean(
  schema: { default?: boolean },
  ctx: GenerateContext,
): boolean {
  if (schema.default !== undefined) return schema.default;
  return ctx.index % 2 === 0;
}

function generateArray(
  schema: { items: SwaggerSchema; minItems?: number; maxItems?: number },
  ctx: GenerateContext,
): unknown[] {
  const min = schema.minItems ?? 1;
  const max = schema.maxItems ?? Math.max(min, 2);
  const length = ctx.rng.int(min, max);

  const items: unknown[] = [];
  for (let i = 0; i < length; i++) {
    items.push(
      generateFromSchema(schema.items, {
        ...ctx,
        depth: ctx.depth + 1,
        index: ctx.index * 100 + i,
        pathHint: `${ctx.pathHint ?? "items"}[${i}]`,
      }),
    );
  }
  return items;
}

function generateObject(
  schema: {
    properties?: Record<string, SwaggerSchema>;
    additionalProperties?: SwaggerSchema | boolean;
  },
  ctx: GenerateContext,
): Record<string, unknown> {
  const obj: Record<string, unknown> = {};

  const props = schema.properties ?? {};
  for (const [key, propSchema] of Object.entries(props)) {
    const nextCtx = {
      ...ctx,
      depth: ctx.depth + 1,
      pathHint: ctx.pathHint ? `${ctx.pathHint}.${key}` : key,
    };
    obj[key] = applyKeyHeuristics(key, propSchema, nextCtx);
  }

  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === "object"
  ) {
    obj["meta"] = generateFromSchema(schema.additionalProperties, {
      ...ctx,
      depth: ctx.depth + 1,
      pathHint: ctx.pathHint ? `${ctx.pathHint}.meta` : "meta",
    });
  }

  return obj;
}

function applyKeyHeuristics(
  key: string,
  schema: SwaggerSchema,
  ctx: GenerateContext,
): unknown {
  if (key === "id" || key.endsWith("_id")) {
    return Math.max(1, (ctx.index % 20) + 1);
  }
  if (key.endsWith("_ids")) {
    const base = Math.max(1, (ctx.index % 20) + 1);
    return [base, ((base + 1) % 20) + 1];
  }
  if (key.endsWith("_at")) {
    return new Date(1704067200000 + ctx.index * 60000).toISOString();
  }
  return generateFromSchema(schema, ctx);
}
