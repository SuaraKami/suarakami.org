export type MaybeArray<T> = T | readonly T[];

function isArray<T>(value: MaybeArray<T>): value is readonly T[] {
  return Array.isArray(value);
}

export function toArray<T>(value: MaybeArray<T>): T[] {
  return isArray(value) ? [...value] : [value];
}

export function normalizeOptions<T extends object>(
  value: boolean | T | undefined,
  defaultEnabled: boolean
): T | null {
  if (value === false) {
    return null;
  }

  if (value === true || (value === undefined && defaultEnabled)) {
    return {} as T;
  }

  if (value === undefined) {
    return null;
  }

  return value;
}
