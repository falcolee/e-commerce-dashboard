import type { MockSpec, SwaggerSchema } from "./types";
import { createRng } from "./rng";
import { generateFromSchema } from "./schema";

export interface Collection {
  name: string;
  items: Array<Record<string, unknown>>;
}

export interface MockDb {
  getCollection(name: string): Collection;
  list(name: string): Array<Record<string, unknown>>;
  getById(name: string, id: number): Record<string, unknown> | undefined;
  create(name: string, value: Record<string, unknown>): Record<string, unknown>;
  update(name: string, id: number, patch: Record<string, unknown>): Record<string, unknown> | undefined;
  remove(name: string, id: number): boolean;
}

export function createMockDb(args: {
  spec: MockSpec;
  seed: number;
  count: number;
  definitionSchemas?: Record<string, SwaggerSchema>;
}): MockDb {
  const { spec, seed, count } = args;
  const rng = createRng(seed);
  const collections = new Map<string, Collection>();

  const ensureSeeded = (name: string) => {
    if (collections.has(name)) return;
    const schema = args.definitionSchemas?.[name] ?? spec.definitions[name];
    const items: Array<Record<string, unknown>> = [];

    for (let i = 1; i <= count; i++) {
      const obj = generateFromSchema(schema, {
        spec,
        rng,
        depth: 0,
        maxDepth: 6,
        index: i,
        pathHint: name,
      });
      const record = (obj && typeof obj === "object" && !Array.isArray(obj) ? obj : {}) as Record<string, unknown>;
      record.id = typeof record.id === "number" ? record.id : i;
      items.push(record);
    }

    collections.set(name, { name, items });
  };

  const getCollection = (name: string) => {
    ensureSeeded(name);
    return collections.get(name)!;
  };

  const list = (name: string) => getCollection(name).items;

  const getById = (name: string, id: number) => list(name).find((x) => x.id === id);

  const create = (name: string, value: Record<string, unknown>) => {
    const col = getCollection(name);
    const nextId = (col.items.reduce((m, x) => Math.max(m, typeof x.id === "number" ? x.id : 0), 0) || 0) + 1;
    const record = { ...value, id: nextId };
    col.items.unshift(record);
    return record;
  };

  const update = (name: string, id: number, patch: Record<string, unknown>) => {
    const col = getCollection(name);
    const index = col.items.findIndex((x) => x.id === id);
    if (index === -1) return undefined;
    col.items[index] = { ...col.items[index], ...patch, id };
    return col.items[index];
  };

  const remove = (name: string, id: number) => {
    const col = getCollection(name);
    const before = col.items.length;
    col.items = col.items.filter((x) => x.id !== id);
    return col.items.length !== before;
  };

  return { getCollection, list, getById, create, update, remove };
}

