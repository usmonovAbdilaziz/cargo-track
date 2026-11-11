import { formatFieldLabel } from "../utils/json-records";
import { formatDisplayValue } from "./table-values";

export function StructuredValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <span>—</span>;

    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, index) => (
          <span
            key={index}
            className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
          >
            <StructuredValue value={item} />
          </span>
        ))}
      </div>
    );
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return <span>—</span>;

    return (
      <div className="space-y-1 text-xs">
        {entries.map(([key, item]) => (
          <div key={key} className="flex flex-wrap gap-x-1">
            <span className="font-medium text-slate-500">{formatFieldLabel([key])}:</span>
            <StructuredValue value={item} />
          </div>
        ))}
      </div>
    );
  }

  return <span>{formatDisplayValue(value)}</span>;
}
