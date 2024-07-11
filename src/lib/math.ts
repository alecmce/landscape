export function clamp(value: number, min: number, max: number): number {
  return Math.max(Math.min(value, max), min)
}

export function positiveMod(a: number, mod: number): number {
  return (a % mod + mod) % mod
}

export function deg2rad(degrees: number): number {
  return Math.PI / 180 * degrees
}
