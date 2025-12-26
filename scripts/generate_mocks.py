#!/usr/bin/env python3

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Set


ROOT = Path(__file__).resolve().parents[1]
SWAGGER_JSON = ROOT / "docs" / "swagger.json"
OUT_FILE = ROOT / "src" / "mocks" / "generated" / "spec.ts"

HTTP_METHODS = {"get", "post", "put", "patch", "delete"}
REF_PREFIX = "#/definitions/"


def resolve_ref_name(ref: str) -> str | None:
    if not ref.startswith(REF_PREFIX):
        return None
    return ref[len(REF_PREFIX) :]


def collect_refs_from_schema(schema: Any, definitions: Dict[str, Any], keep: Set[str]) -> None:
    if not schema or not isinstance(schema, dict):
        return

    if "$ref" in schema and isinstance(schema["$ref"], str):
        name = resolve_ref_name(schema["$ref"])
        if name and name not in keep:
            keep.add(name)
            collect_refs_from_schema(definitions.get(name), definitions, keep)
        return

    if "allOf" in schema and isinstance(schema["allOf"], list):
        for part in schema["allOf"]:
            collect_refs_from_schema(part, definitions, keep)

    if schema.get("type") == "array":
        collect_refs_from_schema(schema.get("items"), definitions, keep)

    if schema.get("type") == "object":
        props = schema.get("properties")
        if isinstance(props, dict):
            for v in props.values():
                collect_refs_from_schema(v, definitions, keep)
        additional = schema.get("additionalProperties")
        if isinstance(additional, dict):
            collect_refs_from_schema(additional, definitions, keep)


def minify_operation(op: Dict[str, Any]) -> Dict[str, Any]:
    out: Dict[str, Any] = {}

    # Keep only the pieces our runtime mock builder needs.
    if "parameters" in op and isinstance(op["parameters"], list):
        out["parameters"] = []
        for p in op["parameters"]:
            if not isinstance(p, dict) or "in" not in p or "name" not in p:
                continue
            kept: Dict[str, Any] = {"name": p["name"], "in": p["in"]}
            if "required" in p:
                kept["required"] = p["required"]
            if "type" in p:
                kept["type"] = p["type"]
            if "schema" in p:
                kept["schema"] = p["schema"]
            out["parameters"].append(kept)

    if "responses" in op and isinstance(op["responses"], dict):
        out["responses"] = {}
        for code, resp in op["responses"].items():
            if code not in {"200", "201", "204"}:
                continue
            if not isinstance(resp, dict):
                continue
            kept_resp: Dict[str, Any] = {}
            if "schema" in resp:
                kept_resp["schema"] = resp["schema"]
            out["responses"][code] = kept_resp

    return out


def main() -> None:
    if not SWAGGER_JSON.exists():
        raise SystemExit(f"Swagger spec not found: {SWAGGER_JSON}")

    spec = json.loads(SWAGGER_JSON.read_text(encoding="utf-8"))

    base_path = spec.get("basePath") or "/api/v1"
    raw_paths = spec.get("paths") or {}
    definitions = spec.get("definitions") or {}

    paths_out: Dict[str, Dict[str, Any]] = {}
    keep_defs: Set[str] = set()

    for path, item in raw_paths.items():
        if not isinstance(path, str) or not path.startswith("/admin/"):
            continue
        if not isinstance(item, dict):
            continue

        methods_out: Dict[str, Any] = {}
        for method, op in item.items():
            if method not in HTTP_METHODS:
                continue
            if not isinstance(op, dict):
                continue

            minimized = minify_operation(op)
            if not minimized:
                continue
            methods_out[method] = minimized

            # Collect response schema refs
            responses = minimized.get("responses") or {}
            if isinstance(responses, dict):
                for resp in responses.values():
                    if isinstance(resp, dict) and "schema" in resp:
                        collect_refs_from_schema(resp["schema"], definitions, keep_defs)

            # Collect request body schema refs (Swagger 2.0 uses parameters in=body)
            for p in minimized.get("parameters") or []:
                if isinstance(p, dict) and p.get("in") == "body" and "schema" in p:
                    collect_refs_from_schema(p["schema"], definitions, keep_defs)

        if methods_out:
            paths_out[path] = methods_out

    defs_out = {name: definitions[name] for name in sorted(keep_defs) if name in definitions}

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    header = (
        "/**\n"
        " * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY\n"
        " *\n"
        " * Generated from: docs/swagger.json\n"
        " * Run: python3 scripts/generate_mocks.py\n"
        " */\n\n"
    )

    payload = {"basePath": base_path, "paths": paths_out, "definitions": defs_out}
    json_text = json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True)

    ts = header + 'import type { MockSpec } from "../types";\n\n' + f"export const mockSpec: MockSpec = {json_text};\n"
    OUT_FILE.write_text(ts, encoding="utf-8")

    print(f"Wrote: {OUT_FILE.relative_to(ROOT)}")
    print(f"Paths: {len(paths_out)} (admin only)")
    print(f"Definitions: {len(defs_out)}")


if __name__ == "__main__":
    main()
