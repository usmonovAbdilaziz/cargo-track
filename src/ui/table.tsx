import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CircleX, Download, Funnel } from "lucide-react";
import { matchesDateFilter } from "../utils/date-filter";

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
  enableExport?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
};

export type TableErrorState = Error | string | null | undefined;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value);
};

const formatDisplayValue = (value: unknown, fallback = "—"): string => {
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

const getNestedValue = (obj: unknown, path: string): unknown => {
  if (!obj) return undefined;

  const segments = path.split(".").filter(Boolean);
  if (segments.length === 0) return undefined;

  let current: unknown = obj;

  for (const segment of segments) {
    if (current == null) return undefined;

    if (Array.isArray(current)) {
      const index = Number(segment);
      current = Number.isInteger(index) ? current[index] : undefined;
      continue;
    }

    if (typeof current !== "object") return undefined;

    const record = current as Record<string, unknown>;
    if (!(segment in record)) return undefined;
    current = record[segment];
  }

  return current;
};

const normalizeExportValue = (value: unknown): string => {
  return formatDisplayValue(value, "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const escapeCsvValue = (value: string) => {
  const normalized = value.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
  if (/[",]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
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
          typeof column.children === "function" ?
            column.children(info.row.original)
          : column.children;

        if (content !== undefined && content !== null) {
          return content;
        }
      }

      const value = info.getValue();
      return formatDisplayValue(value, "—");
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
  enableExport = true,
  enablePagination = true,
  pageSize = 10,
  exportFileName,
  isLoading = false,
  error,
  emptyState,
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
  enableExport?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  exportFileName?: string;
  isLoading?: boolean;
  error?: TableErrorState;
  emptyState?: ReactNode;
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortState, setSortState] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [columnFilter, setColumnFilter] = useState<boolean>(false);
  const [page, setPage] = useState(1);
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
        if (config.type === "date") {
          return matchesDateFilter(value, selected);
        }

        const stringValue = formatDisplayValue(value, "").toLowerCase();
        const filterValue = String(selected).trim().toLowerCase();

        if ((config.type ?? "text") === "text") {
          return stringValue.includes(filterValue);
        }

        return (
          stringValue === filterValue
          || (filterValue === "all" && stringValue !== "")
        );
      });
    }

    return result;
  }, [data, enableFilters, filterConfigs, filterState]);

  const sortedData = useMemo<T[]>(() => {
    if (!enableSorting || !sortState) return [...filteredData];

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortState.key);
      const bValue = getNestedValue(b, sortState.key);
      const left = formatDisplayValue(aValue, "");
      const right = formatDisplayValue(bValue, "");

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

  const totalPages = Math.max(
    1,
    Math.ceil(sortedData.length / Math.max(1, pageSize)),
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedData = useMemo(() => {
    if (!enablePagination) return sortedData;

    const safePageSize = Math.max(1, pageSize);
    const start = (page - 1) * safePageSize;
    return sortedData.slice(start, start + safePageSize);
  }, [enablePagination, page, pageSize, sortedData]);

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

  const errorMessage =
    typeof error === "string" ? error
    : error instanceof Error ? error.message
    : "Ma`lumotlarni yuklashda xatolik yuz berdi.";

  const exportToCsv = () => {
    if (!visibleColumns.length || sortedData.length === 0) return;

    const rows: string[] = [
      visibleColumns
        .map((column) => escapeCsvValue(String(column.header)))
        .join(","),
    ];

    sortedData.forEach((row) => {
      const values = visibleColumns.map((column) => {
        const key = String(column.accessorKey ?? column.id ?? column.header);
        const value = getNestedValue(row, key);
        const cellContent =
          column.cell ?
            column.cell({ row: { original: row }, getValue: () => value })
          : value;

        return escapeCsvValue(normalizeExportValue(cellContent));
      });

      rows.push(values.join(","));
    });

    const csvContent = `\uFEFF${rows.join("\n")}`;
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exportFileName ?? title ?? "table-export"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white shadow-sm">
      {(title
        || filterConfigs.length > 0
        || enableColumnToggle
        || enableExport) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          {title && (
            <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          )}
          <div className="flex items-center gap-2">
            {enableFilters && filterConfigs.length > 0 && (
              <button
                type="button"
                onClick={() => setColumnFilter((prev) => !prev)}
                className={`flex gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                  columnFilter ?
                    "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Funnel />
                Filters Col
              </button>
            )}

            {enableFilters && filterConfigs.length > 0 && (
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className={`flex gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                  isFilterOpen ?
                    "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Funnel />
                Filters Row
              </button>
            )}

            {enableExport && (
              <button
                type="button"
                onClick={exportToCsv}
                className="flex gap-2 text-[7] rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
              >
                <Download /> Excel
              </button>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
          Ma’lumotlar yuklanmoqda...
        </div>
      )}

      {!isLoading && error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          <div className="font-medium">
            Ma’lumotlarni yuklashda xatolik yuz berdi
          </div>
          <div className="mt-1">{errorMessage}</div>
        </div>
      )}

      {!isLoading && !error && sortedData.length === 0 && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
          {emptyState ?? "Hech qanday ma’lumot topilmadi."}
        </div>
      )}

      {enableFilters && isFilterOpen && filterConfigs.length > 0 && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filterConfigs.map((config) => {
              const key = String(config.key);
              const selectedValue = filterState[key] ?? "all";
              const filterType = config.type ?? "text";

              return (
                <div key={key} className="space-y-2 text-sm">
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
      {columnFilter && enableColumnToggle && (
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

      {!isLoading && !error && sortedData.length > 0 && (
        <div className="max-h-[70vh] overflow-auto w-full">
          <table className="min-w-full table-fixed text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700 shadow-sm">
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
              {paginatedData.map((row, rowIndex) => (
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
      )}

      {enablePagination && !isLoading && !error && sortedData.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span>
            {sortedData.length} ta yozuvdan{" "}
            {Math.min((page - 1) * pageSize + 1, sortedData.length)}-
            {Math.min(page * pageSize, sortedData.length)} ko'rsatilmoqda
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Oldingi
            </button>
            <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700">
              {page}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Keyingi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
