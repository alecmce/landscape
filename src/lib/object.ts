export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(value: unknown): value is Function {
  return typeof value === "function"
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number"
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}
