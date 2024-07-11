export function integers(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => i + min)
}
