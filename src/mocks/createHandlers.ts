import { http, HttpResponse, type HttpResponseResolver } from "msw";
import type { MockSpec, SwaggerOperation, SwaggerSchema } from "./types";
import { createRng } from "./rng";
import { createMockDb } from "./store";
import { generateFromSchema } from "./schema";

export interface CreateHandlersOptions {
  spec: MockSpec;
  apiBaseUrl: string;
  seed: number;
  count: number;
  auth: "strict" | "relaxed";
  notFound: boolean;
  errorRate: number;
}

const AUTH_PATHS = new Set<string>([
  "/auth/login",
  "/auth/logout",
  "/auth/me",
  "/auth/refresh",
]);

export function createHandlers(options: CreateHandlersOptions) {
  const rng = createRng(options.seed);
  const db = createMockDb({
    spec: options.spec,
    seed: options.seed,
    count: options.count,
  });

  const handlers: Array<ReturnType<(typeof http)["get"]>> = [];
  const urlsFor = (mswPath: string): string[] => {
    const normalizedPath = mswPath.startsWith("/") ? mswPath : `/${mswPath}`;

    // 1) Match against the API base URL (supports cross-origin requests, e.g. localhost:3000)
    // 2) Match against the API base pathname only (supports relative/base-path setups)
    const candidates = new Set<string>();

    if (/^https?:\/\//i.test(options.apiBaseUrl)) {
      candidates.add(joinUrl(options.apiBaseUrl, normalizedPath));
      try {
        const apiUrl = new URL(options.apiBaseUrl);
        const basePath = apiUrl.pathname.replace(/\/+$/, "");
        candidates.add(`${basePath}${normalizedPath}`);
      } catch {
        // ignore
      }
    } else {
      const basePath = options.apiBaseUrl.replace(/\/+$/, "");
      candidates.add(`${basePath}${normalizedPath}`);
    }

    return Array.from(candidates);
  };

  for (const [swaggerPath, methods] of Object.entries(options.spec.paths)) {
    if (!swaggerPath.startsWith("/admin/")) continue;

    const clientPath = swaggerPath.replace(/^\/admin/, "");
    const clientPathTemplate = clientPath.replace(/{([^}]+)}/g, ":$1");
    const mswPath = clientPathTemplate;
    const handlerUrls = urlsFor(mswPath);

    for (const [method, operation] of Object.entries(methods)) {
      if (!operation) continue;
      const lower = method.toLowerCase();
      if (!["get", "post", "put", "patch", "delete"].includes(lower)) continue;

      const resolver = createResolver({
        ...options,
        rng,
        db,
        clientPath,
        clientPathTemplate,
        operation,
      });

      for (const url of handlerUrls) {
        switch (lower) {
          case "get":
            handlers.push(http.get(url, resolver));
            break;
          case "post":
            handlers.push(http.post(url, resolver));
            break;
          case "put":
            handlers.push(http.put(url, resolver));
            break;
          case "patch":
            handlers.push(http.patch(url, resolver));
            break;
          case "delete":
            handlers.push(http.delete(url, resolver));
            break;
        }
      }
    }
  }

  return handlers;
}

function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  const next = path.replace(/^\/+/, "");
  return `${base}/${next}`;
}

function createResolver(
  args: CreateHandlersOptions & {
    rng: ReturnType<typeof createRng>;
    db: ReturnType<typeof createMockDb>;
    clientPath: string;
    clientPathTemplate: string;
    operation: SwaggerOperation;
  },
): HttpResponseResolver {
  return async ({ request, params }) => {
    if (args.errorRate > 0 && args.rng.next() < args.errorRate) {
      return HttpResponse.json(
        { message: "Mock server error" },
        { status: 500 },
      );
    }

    if (args.auth === "strict" && !AUTH_PATHS.has(args.clientPath)) {
      const auth = request.headers.get("authorization");
      if (!auth)
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const method = request.method.toUpperCase();
    const schemaInfo = pickSuccessResponseSchema(args.operation);
    if (schemaInfo.status === 204)
      return new HttpResponse(null, { status: 204 });

    if (args.clientPath === "/auth/login" && method === "POST") {
      return HttpResponse.json(mockLogin(await safeJson(request), args.rng), {
        status: 200,
      });
    }
    if (args.clientPath === "/auth/me" && method === "GET") {
      return HttpResponse.json(mockMe(args.rng), { status: 200 });
    }
    if (args.clientPath === "/auth/refresh" && method === "POST") {
      return HttpResponse.json(mockRefresh(args.rng), { status: 200 });
    }
    if (args.clientPath === "/auth/logout" && method === "POST") {
      return HttpResponse.json({ success: true }, { status: 200 });
    }

    if (args.clientPath === "/dashboard/revenue" && method === "GET") {
      const url = new URL(request.url);
      const period = url.searchParams.get("period") ?? "daily";
      const isDaily = period === "daily";
      const points = isDaily ? 7 : 4;
      const stepMs = isDaily ? 86400000 : 7 * 86400000;
      const start = Date.now() - (points - 1) * stepMs;

      const items = Array.from({ length: points }, (_, i) => {
        const date = new Date(start + i * stepMs).toISOString().slice(0, 10);
        const orders = args.rng.int(120, 980);
        const averageOrderValue = args.rng.float(35, 240);
        const revenue = Number((orders * averageOrderValue).toFixed(2));
        return {
          date,
          period: date,
          orders,
          revenue,
        };
      });

      return HttpResponse.json(items, { status: 200 });
    }

    if (args.clientPath === "/dashboard/sales" && method === "GET") {
      const url = new URL(request.url);
      const period = url.searchParams.get("period") ?? "daily";
      const isDaily = period === "daily";
      const points = isDaily ? 7 : 4;
      const stepMs = isDaily ? 86400000 : 7 * 86400000;
      const start = Date.now() - (points - 1) * stepMs;

      const items = Array.from({ length: points }, (_, i) => {
        const date = new Date(start + i * stepMs).toISOString().slice(0, 10);
        const total_orders = args.rng.int(80, 980);
        const average_order_value = Number(args.rng.float(24, 220).toFixed(2));
        const total_revenue = Number((total_orders * average_order_value).toFixed(2));
        const conversion_rate = Number(args.rng.float(0.8, 4.8).toFixed(2));
        return {
          period: date,
          total_orders,
          total_revenue,
          average_order_value,
          conversion_rate,
        };
      });

      return HttpResponse.json(items, { status: 200 });
    }

    if (args.clientPath === "/dashboard/top-products" && method === "GET") {
      const url = new URL(request.url);
      const limit = Math.max(1, Math.min(12, Number(url.searchParams.get("limit") ?? "4") || 4));
      const baseUrl = import.meta.env.BASE_URL ?? "/";
      const imageUrls = [
        `${baseUrl}mock/products/sneakers.jpg`,
        `${baseUrl}mock/products/headphones.jpg`,
        `${baseUrl}mock/products/watch.jpg`,
        `${baseUrl}mock/products/backpack.jpg`,
      ];

      const presets = [
        { name: "Nike Sneakers", sku: "SNK-001" },
        { name: "Beats Headphones", sku: "HDP-002" },
        { name: "Wood Watch", sku: "WCH-003" },
        { name: "Yellow Backpack", sku: "BAG-004" },
        { name: "Minimal Desk Lamp", sku: "LMP-005" },
        { name: "Ceramic Mug", sku: "MUG-006" },
        { name: "Wireless Mouse", sku: "MSE-007" },
        { name: "Scented Candle", sku: "CND-008" },
      ];

      const items = Array.from({ length: limit }, (_, i) => {
        const preset = presets[i % presets.length];
        const total_sold = args.rng.int(18, 240);
        const price = Number(args.rng.float(18, 220).toFixed(2));
        const total_revenue = Number((total_sold * price).toFixed(2));
        return {
          product_id: i + 1,
          product_name: preset.name,
          sku: preset.sku,
          image_url: imageUrls[i % imageUrls.length],
          total_sold,
          total_revenue,
        };
      });

      return HttpResponse.json(items, { status: 200 });
    }

    if (
      isPaginatedResponse(args, schemaInfo.schema) &&
      method === "GET" &&
      !("id" in params)
    ) {
      const { itemRefName } = getPaginatedItemRef(args, schemaInfo.schema);
      if (itemRefName) {
        const query = new URL(request.url).searchParams;
        const page = Number(query.get("page") ?? "1") || 1;
        const pageSize =
          Number(query.get("page_size") ?? query.get("pageSize") ?? "20") || 20;

        const all = args.db.list(itemRefName);
        const start = (page - 1) * pageSize;
        const items = all.slice(start, start + pageSize);
        const total = all.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));

        return HttpResponse.json(
          {
            items,
            pagination: {
              page,
              page_size: pageSize,
              total,
              total_pages: totalPages,
            },
          },
          { status: 200 },
        );
      }
    }

    if (method === "GET" && typeof params.id === "string") {
      const id = Number(params.id);
      const refName = inferResourceRefFromPath(args.clientPathTemplate);
      if (refName) {
        const found = args.db.getById(refName, id);
        if (!found) {
          if (args.notFound)
            return HttpResponse.json({ message: "Not found" }, { status: 404 });
          return HttpResponse.json(
            generateExample(args, schemaInfo.schema, id),
            { status: 200 },
          );
        }
        return HttpResponse.json(found, { status: 200 });
      }
    }

    if (method === "POST") {
      const refName = inferResourceRefFromPath(args.clientPathTemplate);
      if (refName) {
        const body = await safeJson(request);
        const created = args.db.create(
          refName,
          (body && typeof body === "object" ? body : {}) as Record<
            string,
            unknown
          >,
        );
        return HttpResponse.json(created, { status: schemaInfo.status });
      }
    }

    if (method === "PUT" || method === "PATCH") {
      const refName = inferResourceRefFromPath(args.clientPathTemplate);
      if (refName && typeof params.id === "string") {
        const id = Number(params.id);
        const body = await safeJson(request);
        const updated = args.db.update(
          refName,
          id,
          (body && typeof body === "object" ? body : {}) as Record<
            string,
            unknown
          >,
        );
        if (!updated && args.notFound)
          return HttpResponse.json({ message: "Not found" }, { status: 404 });
        return HttpResponse.json(
          updated ?? generateExample(args, schemaInfo.schema, id),
          { status: schemaInfo.status },
        );
      }
    }

    if (method === "DELETE" && typeof params.id === "string") {
      const refName = inferResourceRefFromPath(args.clientPathTemplate);
      if (refName) {
        const id = Number(params.id);
        const ok = args.db.remove(refName, id);
        if (!ok && args.notFound)
          return HttpResponse.json({ message: "Not found" }, { status: 404 });
        return HttpResponse.json(
          { success: true },
          { status: schemaInfo.status },
        );
      }
    }

    return HttpResponse.json(generateExample(args, schemaInfo.schema, 1), {
      status: schemaInfo.status,
    });
  };
}

function pickSuccessResponseSchema(operation: SwaggerOperation): {
  status: number;
  schema?: SwaggerSchema;
} {
  const responses = operation.responses ?? {};
  if (responses["204"]) return { status: 204 };
  if (responses["201"]) return { status: 201, schema: responses["201"].schema };
  if (responses["200"]) return { status: 200, schema: responses["200"].schema };
  return { status: 200, schema: undefined };
}

function isPaginatedResponse(
  args: { spec: MockSpec },
  schema: SwaggerSchema | undefined,
): boolean {
  if (!schema) return false;
  if (!("allOf" in schema)) return false;
  return schema.allOf.some((s) =>
    "$ref" in s ? s.$ref === "#/definitions/response.PaginatedResponse" : false,
  );
}

function getPaginatedItemRef(
  args: { spec: MockSpec },
  schema: SwaggerSchema | undefined,
): { itemRefName: string | null } {
  if (!schema || !("allOf" in schema)) return { itemRefName: null };

  for (const part of schema.allOf) {
    if ("type" in part && part.type === "object") {
      const itemsSchema = part.properties?.items;
      if (
        itemsSchema &&
        "type" in itemsSchema &&
        itemsSchema.type === "array"
      ) {
        const items = itemsSchema.items;
        if ("$ref" in items) {
          const name = items.$ref.split("/").slice(-1)[0];
          return { itemRefName: name };
        }
      }
    }
  }

  return { itemRefName: null };
}

function inferResourceRefFromPath(clientPath: string): string | null {
  const base = clientPath.replace(/\/:id$/, "").replace(/\/\d+$/, "");
  const parts = base.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const collection = parts[0];
  switch (collection) {
    case "users":
      return "response.UserResponse";
    case "products":
      return "response.ProductResponse";
    case "orders":
      return "response.OrderResponse";
    case "posts":
      return "response.PostResponse";
    case "roles":
      return "response.RoleDetailResponse";
    case "permissions":
      return "response.PermissionResponse";
    default:
      return null;
  }
}

function generateExample(
  args: { spec: MockSpec; rng: ReturnType<typeof createRng> },
  schema: SwaggerSchema | undefined,
  index: number,
): unknown {
  return generateFromSchema(schema, {
    spec: args.spec,
    rng: args.rng,
    depth: 0,
    maxDepth: 6,
    index,
    pathHint: "response",
  });
}

async function safeJson(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function mockLogin(body: unknown, rng: ReturnType<typeof createRng>) {
  const username =
    typeof (body as any)?.username === "string"
      ? (body as any).username
      : "admin";
  const isAdmin = username === "admin";
  const id = isAdmin ? 1 : Math.max(2, rng.int(2, 20));

  return {
    access_token: `mock_access_${id}_${Date.now()}`,
    refresh_token: `mock_refresh_${id}_${Date.now()}`,
    user: mockUser(id, username, isAdmin),
  };
}

function mockMe(rng: ReturnType<typeof createRng>) {
  return mockUser(1, "admin", true);
}

function mockRefresh(rng: ReturnType<typeof createRng>) {
  return {
    access_token: `mock_access_1_${Date.now()}`,
    refresh_token: `mock_refresh_1_${Date.now()}`,
  };
}

function mockUser(id: number, username: string, isAdmin: boolean) {
  return {
    id,
    username,
    email: `${username}@example.com`,
    display_name: isAdmin ? "Admin" : `User ${id}`,
    status: 1,
    roles: isAdmin
      ? [{ name: "admin", display_name: "Administrator" }]
      : [{ name: "editor", display_name: "Editor" }],
    permissions: isAdmin ? ["*"] : [],
    registered_at: new Date(1704067200000).toISOString(),
    last_login_at: new Date().toISOString(),
  };
}
