import type { Category, Tag } from '@/lib/types';

function toFiniteNumber(value: unknown): number | null {
  const parsed =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function toTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function sanitizeCategoryTree(value: unknown): Category[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((node) => sanitizeCategoryNode(node))
    .filter((node): node is Category => node !== null);
}

function sanitizeCategoryNode(value: unknown): Category | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as any;

  const id = toFiniteNumber(raw.id) ?? toFiniteNumber(raw.term_id);
  if (id === null) return null;

  const termId = toFiniteNumber(raw.term_id) ?? id;
  const name = toTrimmedString(raw.name) ?? `Category ${termId}`;
  const slug = toTrimmedString(raw.slug) ?? `category-${termId}`;

  return {
    id,
    term_id: termId,
    name,
    slug,
    parent_id: toFiniteNumber(raw.parent_id) ?? undefined,
    description: typeof raw.description === 'string' ? raw.description : undefined,
    count: toFiniteNumber(raw.count) ?? undefined,
    menu_order: toFiniteNumber(raw.menu_order) ?? undefined,
    image_url: typeof raw.image_url === 'string' ? raw.image_url : undefined,
    children: sanitizeCategoryTree(raw.children),
    created_at: typeof raw.created_at === 'string' ? raw.created_at : undefined,
    updated_at: typeof raw.updated_at === 'string' ? raw.updated_at : undefined,
  };
}

export function sanitizeTags(value: unknown): Tag[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((node) => sanitizeTagNode(node))
    .filter((node): node is Tag => node !== null);
}

function sanitizeTagNode(value: unknown): Tag | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as any;

  const id = toFiniteNumber(raw.id) ?? toFiniteNumber(raw.term_id);
  if (id === null) return null;

  const termId = toFiniteNumber(raw.term_id) ?? id;
  const name = toTrimmedString(raw.name) ?? `Tag ${termId}`;
  const slug = toTrimmedString(raw.slug) ?? `tag-${termId}`;

  return {
    id,
    term_id: termId,
    name,
    slug,
    description: typeof raw.description === 'string' ? raw.description : undefined,
    count: toFiniteNumber(raw.count) ?? undefined,
    created_at: typeof raw.created_at === 'string' ? raw.created_at : undefined,
    updated_at: typeof raw.updated_at === 'string' ? raw.updated_at : undefined,
  };
}

