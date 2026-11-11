import { useMemo, useState, type ReactNode } from "react";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { CircleX, Download, Funnel } from "lucide-react";
import { matchesDateFilter } from "../utils/date-filter";
import { discoverFields, formatFieldLabel, getFieldValue } from "../utils/json-records";
import { formatDisplayValue } from "./table-values";
import { StructuredValue } from "./structured-value";
import { RecordDetails } from "./record-details";
import type { TableColumn } from "./table-columns";

const tableFeaturesConfig = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});

const EMPTY_DATA: never[] = [];
const EMPTY_COLUMN_KEYS: readonly string[] = [];

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

export function DataTable<T extends object>({
  data,
  columns,
  title,
  filterKey,
  filterOptions,
  filters,
  trailingColumnKeys = EMPTY_COLUMN_KEYS,
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
  columns: TableColumn<T>[];
  title?: string;
  filterKey?: keyof T | string;
  filterOptions?: TableFilterOption[];
  filters?: TableFilterConfig<T>[];
  trailingColumnKeys?: readonly string[];
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
  const [columnFilter, setColumnFilter] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const safeData = Array.isArray(data) ? data : EMPTY_DATA;

  const extraColumns = useMemo(() => {
    const knownKeys = new Set(columns.map((column) => String(column.accessorKey)));
    const fields = discoverFields(safeData);
    return fields
      .filter((field) => {
        const hasNestedFields = fields.some((other) =>
          other.path.length > field.path.length
          && field.path.every((part, index) => other.path[index] === part),
        );
        if (!hasNestedFields) return true;

        return safeData.some((row) => {
          const value = getFieldValue(row, field.path);
          return value != null && (typeof value !== "object" || Array.isArray(value));
        });
      })
      .filter((field) => !knownKeys.has(field.path.join(".")) || field.path.some((part) => part.includes(".")))
      .map((field) => ({
        accessorKey: `__json_field__${field.id}`,
        header: formatFieldLabel(field.path),
        fieldPath: field.path,
        getValue: (row: T) => getFieldValue(row, field.path),
        cell: (info: { getValue: () => unknown }) => <StructuredValue value={info.getValue()} />,
      }));
  }, [columns, safeData]);

  const allColumns = useMemo(() => [
    ...columns.filter((column) => !trailingColumnKeys.includes(column.accessorKey)),
    ...extraColumns,
    ...trailingColumnKeys.flatMap((key) => columns.filter((column) => column.accessorKey === key)),
    {
      accessorKey: "__json_record_details__",
      header: "To‘liq yozuv",
      enableSorting: false,
      getValue: (row: T) => JSON.stringify(row),
      cell: (info: { row: { original: T } }) => <RecordDetails record={info.row.original} />,
    },
  ], [columns, extraColumns, trailingColumnKeys]);

  const filterConfigs = useMemo<TableFilterConfig<T>[]>(() => {
    let configured: TableFilterConfig<T>[] = filters ?? [];

    if (configured.length === 0 && filterKey && filterOptions) {
      configured = [
        { key: filterKey, label: String(filterKey), options: filterOptions },
      ];
    }

    const configuredPaths = new Set(configured.map((config) => JSON.stringify(String(config.key).split("."))));
    return [
      ...configured,
      ...extraColumns
        .filter((column) => !configuredPaths.has(JSON.stringify(column.fieldPath)))
        .map((column) => ({
          key: column.accessorKey,
          label: column.header,
          type: "text" as const,
        })),
    ];
  }, [filterKey, filterOptions, filters, extraColumns]);

  const filterOnlyKeys = useMemo(() => {
    const existingKeys = new Set(allColumns.map((column) => column.accessorKey));
    return filterConfigs.map((config) => String(config.key)).filter((key) => !existingKeys.has(key));
  }, [allColumns, filterConfigs]);

  const tableColumns = useMemo<ColumnDef<typeof tableFeaturesConfig, T>[]>(() => {
    const sources: TableColumn<T>[] = [
      ...allColumns,
      ...filterOnlyKeys.map((key) => ({ accessorKey: key, header: key })),
    ];

    return sources.map((column) => {
      const key = column.accessorKey;
      const filterType = filterConfigs.find((config) => String(config.key) === key)?.type ?? "text";
      return {
        id: key,
        header: column.header,
        accessorFn: (row: T) => column.getValue ? column.getValue(row) : getNestedValue(row, key),
        cell: column.cell,
        enableSorting: column.enableSorting !== false,
        enableHiding: !filterOnlyKeys.includes(key),
        sortDescFirst: false,
        sortFn: (a, b, columnId) => {
          const left = formatDisplayValue(a.getValue(columnId), "");
          const right = formatDisplayValue(b.getValue(columnId), "");
          const numericLeft = Number(left);
          const numericRight = Number(right);
          return !Number.isNaN(numericLeft) && !Number.isNaN(numericRight)
            ? numericLeft - numericRight
            : left.localeCompare(right);
        },
        filterFn: (row, columnId, selected) => {
          const value = row.getValue(columnId);
          if (filterType === "date") return matchesDateFilter(value, String(selected));
          const text = formatDisplayValue(value, "").toLowerCase();
          const filter = String(selected).trim().toLowerCase();
          return filterType === "select" ? text === filter : text.includes(filter);
        },
      };
    });
  }, [allColumns, filterConfigs, filterOnlyKeys]);

  const visibility = useMemo(() => ({
    ...columnVisibility,
    ...Object.fromEntries(filterOnlyKeys.map((key) => [key, false])),
  }), [columnVisibility, filterOnlyKeys]);

  const table = useTable({
    features: tableFeaturesConfig,
    data: safeData,
    columns: tableColumns,
    state: { columnVisibility: visibility },
    onColumnVisibilityChange: setColumnVisibility,
    initialState: { pagination: { pageIndex: 0, pageSize: Math.max(1, pageSize) } },
    enableSorting,
    enableSortingRemoval: false,
    enableMultiSort: false,
    manualFiltering: !enableFilters,
    manualPagination: !enablePagination,
    autoResetPageIndex: true,
  });

  const visibleColumns = table.getVisibleLeafColumns();
  const sortedRows = table.getPrePaginatedRowModel().rows;
  const paginatedRows = table.getRowModel().rows;
  const currentPage = table.state.pagination.pageIndex + 1;
  const totalPages = Math.max(1, table.getPageCount());
  const allColumnOptions = table.getAllLeafColumns().filter((column) => column.getCanHide());

  const updateFilter = (key: string, value: string) => {
    table.getColumn(key)?.setFilterValue(value || undefined);
    table.setPageIndex(0);
  };

  const errorMessage =
    typeof error === "string" ? error
    : error instanceof Error ? error.message
    : "Ma`lumotlarni yuklashda xatolik yuz berdi.";

  const exportToCsv = () => {
    if (!visibleColumns.length || sortedRows.length === 0) return;

    const rows: string[] = [
      visibleColumns
        .map((column) => escapeCsvValue(String(column.columnDef.header)))
        .join(","),
    ];

    sortedRows.forEach((row) => {
      const values = row.getVisibleCells().map((cell) => {
        const renderer = cell.column.columnDef.cell;
        const cellContent =
          cell.column.id === "__json_record_details__" || cell.column.id.startsWith("__json_field__") ? cell.getValue()
          : typeof renderer === "function" ? renderer(cell.getContext())
          : cell.getValue();
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          {title && (
            <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          )}
          <div className="flex flex-wrap items-center gap-2">
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

      {!isLoading && !error && sortedRows.length === 0 && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
          {emptyState ?? "Hech qanday ma’lumot topilmadi."}
        </div>
      )}

      {enableFilters && isFilterOpen && filterConfigs.length > 0 && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filterConfigs.map((config) => {
              const key = String(config.key);
              const selectedValue = String(table.getColumn(key)?.getFilterValue() ?? "");
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
                      <option value="">Barchasi</option>
                      {config.options
                        .filter((option) => option.value !== "")
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
                        value={selectedValue}
                        onChange={(event) =>
                          updateFilter(key, event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
                      />
                      {selectedValue !== "" && (
                        <button
                          type="button"
                          onClick={() => updateFilter(key, "")}
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
                        value={selectedValue}
                        placeholder="Barchasi"
                        onChange={(event) =>
                          updateFilter(key, event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
                      />
                      {selectedValue !== "" && (
                        <button
                          type="button"
                          onClick={() => updateFilter(key, "")}
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
                key={option.id}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={option.getIsVisible()}
                  onChange={() => option.toggleVisibility()}
                  className="h-4 w-4 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                {String(option.columnDef.header)}
              </label>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !error && sortedRows.length > 0 && (
        <div className="max-h-[70vh] overflow-auto w-full">
          <table className="w-max min-w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700 shadow-sm">
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => {
                    const isSorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        className={`min-w-36 border-b border-slate-200 px-4 py-3 font-medium ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
                        onClick={() => header.column.getCanSort() && header.column.toggleSorting()}
                      >
                        <div className="flex items-center gap-1">
                          <span>{header.isPlaceholder ? null : <table.FlexRender header={header} />}</span>
                          {isSorted && <span className="text-xs text-slate-500">{isSorted === "asc" ? "↑" : "↓"}</span>}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody>
              {paginatedRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="max-w-80 break-words px-4 py-3 text-slate-700">
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {enablePagination && !isLoading && !error && sortedRows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span>
            {sortedRows.length} ta yozuvdan{" "}
            {Math.min((currentPage - 1) * pageSize + 1, sortedRows.length)}-
            {Math.min(currentPage * pageSize, sortedRows.length)} ko'rsatilmoqda
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Oldingi
            </button>
            <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700">
              {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
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
