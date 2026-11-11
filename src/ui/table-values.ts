const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value);
};

export const formatDisplayValue = (value: unknown, fallback = "—"): string => {
  if (value == null || value === "") return fallback;

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized || fallback;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : fallback;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => formatDisplayValue(item, ""))
      .filter((item) => item !== "");
    return parts.length ? parts.join(", ") : fallback;
  }

  if (isRecord(value)) {
    const props = value as { props?: { children?: unknown } };
    if (props.props && "children" in props.props) {
      return formatDisplayValue(props.props.children, fallback);
    }

    const nestedValues = Object.values(value)
      .map((item) => formatDisplayValue(item, ""))
      .filter((item) => item !== "");

    return nestedValues.length ? nestedValues.join(", ") : fallback;
  }

  return fallback;
};

