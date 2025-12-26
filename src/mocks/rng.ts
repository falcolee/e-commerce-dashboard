export interface Rng {
  next(): number;
  int(min: number, max: number): number;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number) => {
    if (max < min) return min;
    const n = next();
    return Math.floor(n * (max - min + 1)) + min;
  };

  return { next, int };
}

