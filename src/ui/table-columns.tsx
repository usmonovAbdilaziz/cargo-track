import type { ReactNode } from "react";
import { formatDisplayValue } from "./table-values";

export type TableColumnConfig<T extends object> = {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T) => ReactNode;
  children?: ReactNode | ((row: T) => ReactNode);
};

export type TableColumn<T extends object> = {
  accessorKey: string;
  header: string;
  getValue?: (row: T) => unknown;
  enableSorting?: boolean;
  cell?: (info: { row: { original: T }; getValue: () => unknown }) => ReactNode;
};

export function createTableColumns<T extends object>(
  columns: TableColumnConfig<T>[],
): TableColumn<T>[] {
  return columns.map((column) => ({
    accessorKey: String(column.key),
    header: column.header,
    cell: (info) => {
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

