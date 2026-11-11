type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export function extractRecords<T extends object>(
  payload: unknown,
  preferredPaths: string[][],
): T[] {
  const normalize = (values: unknown[]): T[] =>
    values.map((value) => (isRecord(value) ? value : { _value: value }) as T);

  if (Array.isArray(payload)) return normalize(payload);

  let emptyPreferred: unknown[] | undefined;
  for (const path of preferredPaths) {
    let value: unknown = payload;
    for (const key of path) value = isRecord(value) ? value[key] : undefined;
    if (Array.isArray(value)) {
      if (value.length > 0) return normalize(value);
      emptyPreferred = value;
    }
  }

  const candidates: { path: string; values: unknown[] }[] = [];
  const visit = (value: unknown, path: string) => {
    if (!isRecord(value)) return;
    for (const [key, child] of Object.entries(value)) {
      const nextPath = path ? `${path}.${key}` : key;
      if (Array.isArray(child)) {
        if (child.length === 0 || child.some(isRecord)) {
          candidates.push({ path: nextPath, values: child });
        }
      } else if (isRecord(child)) {
        visit(child, nextPath);
      }
    }
  };
  visit(payload, "");

  const nonEmpty = candidates.filter((candidate) => candidate.values.length > 0);
  if (nonEmpty.length === 0 && emptyPreferred) return normalize(emptyPreferred);
  const possible = nonEmpty.length ? nonEmpty : candidates;
  if (possible.length === 1) return normalize(possible[0].values);
  if (possible.length > 1) {
    throw new Error(`JSON ichida bir nechta yozuvlar ro‘yxati topildi: ${possible.map((item) => item.path).join(", ")}.`);
  }
  throw new Error("JSON ichida yozuvlar ro‘yxati topilmadi.");
}

export type JsonField = { path: string[]; id: string; label: string };

export function discoverFields(rows: object[]): JsonField[] {
  const fields = new Map<string, JsonField>();
  const visit = (value: unknown, path: string[]) => {
    if (isRecord(value) && Object.keys(value).length > 0) {
      for (const [key, child] of Object.entries(value)) visit(child, [...path, key]);
      return;
    }
    if (path.length === 0) return;
    const id = JSON.stringify(path);
    fields.set(id, { path, id, label: path.join(".") });
  };
  for (const row of rows) visit(row, []);
  return [...fields.values()];
}

export function getFieldValue(row: unknown, path: string[]): unknown {
  return path.reduce<unknown>((value, key) => isRecord(value) ? value[key] : undefined, row);
}

export function displayJsonValue(value: unknown): string {
  if (value == null || value === "") return "—";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}
