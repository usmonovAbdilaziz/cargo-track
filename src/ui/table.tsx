import { useMemo, useState, type ReactNode } from "react";
import { CircleX } from "lucide-react";

export type TableColumnConfig<T extends object> = {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T) => ReactNode;
  children?: ReactNode | ((row: T) => ReactNode);
};

export type TableFilterOption = {
  value: string;
  label: string;
};

export type TableFilterConfig<T> = {
  key: keyof T | string;
  label?: string;
  type?: "text" | "select" | "date";
  options?: TableFilterOption[];
};

export type DataTableOptions = {
  enableFilters?: boolean;
  enableSorting?: boolean;
  enableColumnToggle?: boolean;
};

const getNestedValue = (obj: unknown, path: string): unknown => {
  if (!obj || typeof obj !== "object") return undefined;

  const segments = path.split(".");
  let current: unknown = obj;

  for (const segment of segments) {
    if (current == null || typeof current !== "object") return undefined;
    const record = current as Record<string, unknown>;
    if (!(segment in record)) return undefined;
    current = record[segment];
  }

  return current;
};

export function createTableColumns<T extends object>(
  columns: TableColumnConfig<T>[],
) {
  return columns.map((column) => ({
    accessorKey: String(column.key),
    header: column.header,
    cell: (info: any) => {
      if (column.render) return column.render(info.row.original);

      if (column.children !== undefined) {
        const content =
          typeof column.children === "function"
            ? column.children(info.row.original)
            : column.children;

        if (content !== undefined && content !== null) {
          return content;
        }
      }

      const value = info.getValue();
      return value ?? "-";
    },
  }));
}

export function DataTable<T extends object>({
  data,
  columns,
  title,
  filterKey,
  filterOptions,
  filters,
  enableFilters = true,
  enableSorting = true,
  enableColumnToggle = true,
}: {
  data: T[];
  columns: any[];
  title?: string;
  filterKey?: keyof T | string;
  filterOptions?: TableFilterOption[];
  filters?: TableFilterConfig<T>[];
  enableFilters?: boolean;
  enableSorting?: boolean;
  enableColumnToggle?: boolean;
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortState, setSortState] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(() => {
    return Object.fromEntries(
      columns.map((column) => [String(column.accessorKey), true]),
    );
  });
  const [filterState, setFilterState] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};

    if (filterKey) initial[String(filterKey)] = "all";
    if (filters) {
      for (const filter of filters) {
        initial[String(filter.key)] = "all";
      }
    }

    return initial;
  });

  const filterConfigs = useMemo(() => {
    if (filters && filters.length > 0) {
      return filters;
    }

    if (filterKey && filterOptions) {
      return [
        { key: filterKey, label: String(filterKey), options: filterOptions },
      ];
    }

    return [];
  }, [filterKey, filterOptions, filters]);

  const visibleColumns = useMemo(() => {
    return columns.filter((column) => {
      const key = String(column.accessorKey ?? column.id ?? column.header);
      return columnVisibility[key] !== false;
    });
  }, [columnVisibility, columns]);

  const filteredData = useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];
    let result = safeData;
    if (!enableFilters || filterConfigs.length === 0) return result;

    for (const config of filterConfigs) {
      const key = String(config.key);
      const selected = filterState[key] ?? "all";

      if (!selected || selected === "all") continue;

      result = result.filter((item) => {
        const value = getNestedValue(item, key);
        const stringValue = value == null ? "" : String(value);
        const filterValue = String(selected).trim();

        if ((config.type ?? "text") === "text") {
          return stringValue.toLowerCase().includes(filterValue.toLowerCase());
        }

        return stringValue === filterValue;
      });
    }

    return result;
  }, [data, enableFilters, filterConfigs, filterState]);

  const sortedData = useMemo<T[]>(() => {
    if (!enableSorting || !sortState) return [...filteredData];

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortState.key);
      const bValue = getNestedValue(b, sortState.key);
      const left = aValue == null ? "" : String(aValue);
      const right = bValue == null ? "" : String(bValue);

      const numericLeft = Number(left);
      const numericRight = Number(right);
      const isNumeric =
        !Number.isNaN(numericLeft) && !Number.isNaN(numericRight);

      let comparison = 0;

      if (isNumeric) {
        comparison = numericLeft - numericRight;
      } else {
        comparison = left.localeCompare(right);
      }

      return sortState.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, enableSorting, sortState]);

  const updateFilter = (key: string, value: string) => {
    setFilterState((prev) => ({ ...prev, [key]: value }));
  };

  const toggleColumn = (key: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  const handleSort = (key: string) => {
    setSortState((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      return {
        key,
        direction: prev.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const allColumnOptions = columns.map((column) => ({
    key: String(column.accessorKey ?? column.id ?? column.header),
    label: String(column.header),
  }));

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white shadow-sm">
      {(title || filterConfigs.length > 0 || enableColumnToggle) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          {title && (
            <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          )}
          <div className="flex items-center gap-2">
            {enableColumnToggle && (
              <div className="  px-4 py-4">
                <div className="flex flex-wrap gap-3">
                  {allColumnOptions.map((option) => (
                    <label
                      key={option.key}
                      className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
                    >
                      <input
                        type="checkbox"
                        checked={columnVisibility[option.key] !== false}
                        onChange={() => toggleColumn(option.key)}
                        className="h-4 w-4 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {enableFilters && filterConfigs.length > 0 && (
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                  isFilterOpen ?
                    "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Filters
              </button>
            )}
          </div>
        </div>
      )}

      {enableFilters && isFilterOpen && filterConfigs.length > 0 && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex items-center justify-between gap-3 pb-3">
            <h3 className="text-base font-semibold text-slate-800">Filters</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filterConfigs.map((config) => {
              const key = String(config.key);
              const selectedValue = filterState[key] ?? "all";
              const filterType = config.type ?? "text";

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      {config.label ?? key}
                    </label>
                  </div>

                  {filterType === "select" && config.options ?
                    <select
                      value={selectedValue}
                      onChange={(event) =>
                        updateFilter(key, event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
                    >
                      <option value="all">Barchasi</option>
                      {config.options
                        .filter((option) => option.value !== "all")
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                  : filterType === "date" ?
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={selectedValue === "all" ? "" : selectedValue}
                        onChange={(event) =>
                          updateFilter(key, event.target.value || "all")
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
                      />
                      {selectedValue !== "all" && (
                        <button
                          type="button"
                          onClick={() => updateFilter(key, "all")}
                          className="rounded-md border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700"
                          aria-label={`Clear ${config.label ?? key} filter`}
                        >
                          <CircleX size={14} />
                        </button>
                      )}
                    </div>
                  : <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={selectedValue === "all" ? "" : selectedValue}
                        placeholder="Barchasi"
                        onChange={(event) =>
                          updateFilter(key, event.target.value || "all")
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
                      />
                      {selectedValue !== "all" && (
                        <button
                          type="button"
                          onClick={() => updateFilter(key, "all")}
                          className="rounded-md border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700"
                          aria-label={`Clear ${config.label ?? key} filter`}
                        >
                          <CircleX size={14} />
                        </button>
                      )}
                    </div>
                  }
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              {visibleColumns.map((column) => {
                const key = String(
                  column.accessorKey ?? column.id ?? column.header,
                );
                const isSorted = sortState?.key === key;

                return (
                  <th
                    key={key}
                    className={`border-b border-slate-200 px-4 py-3 font-medium ${enableSorting ? "cursor-pointer select-none" : ""}`}
                    onClick={() => enableSorting && handleSort(key)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.header}</span>
                      {enableSorting && isSorted && (
                        <span className="text-xs text-slate-500">
                          {sortState?.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                {visibleColumns.map((column) => {
                  const key = String(
                    column.accessorKey ?? column.id ?? column.header,
                  );
                  const value = getNestedValue(row, key);
                  const cellContent =
                    column.cell ?
                      column.cell({
                        row: { original: row },
                        getValue: () => value,
                      })
                    : (value ?? "-");

                  return (
                    <td
                      key={`${rowIndex}-${key}`}
                      className="px-4 py-3 text-slate-700"
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
