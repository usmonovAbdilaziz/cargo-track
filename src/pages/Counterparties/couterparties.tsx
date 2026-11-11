import { useMemo } from "react";
import { useCounterpartiesData } from "../../services/LogisticanServices";
import type { Counterparty } from "../../types/counterparties";
import { DataTable } from "../../ui/table";
import { createTableColumns } from "../../ui/table-columns";
import { displayJsonValue } from "../../utils/json-records";

const EMPTY_COUNTERPARTIES: Counterparty[] = [];

export const Counterparties = () => {
  const {
    data: counterparties = EMPTY_COUNTERPARTIES,
    isLoading,
    error,
  } = useCounterpartiesData();

  const filterConfigs = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        type: "text" as const,
      },
      {
        key: "kind",
        label: "Kind",
        type: "select" as const,
        options: Array.from(
          new Set(
            counterparties
              .map((item) => typeof item?.kind === "string" ? item.kind.trim() : "")
              .filter(Boolean),
          ),
        )
          .sort((a, b) => a.localeCompare(b))
          .map((kind) => ({
            value: kind,
            label: kind.charAt(0).toUpperCase() + kind.slice(1).replace(/_/g, " "),
          })),
      },
      {
        key: "phone",
        label: "Phone",
        type: "text" as const,
      },
      {
        key: "inn",
        label: "INN",
        type: "text" as const,
      },
      {
        key: "rows",
        label: "Rows",
        type: "text" as const,
      },
      {
        key: "since",
        label: "Since",
        type: "date" as const,
      },
    ],
    [counterparties],
  );

  const columns = useMemo(
    () =>
      createTableColumns<Counterparty>([
        { key: "name", header: "Name" },
        {
          key: "kind",
          header: "Kind",
          render: (row) => {
            return (
              <span
                className={
                  row.kind === "legal"
                    ? "rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                    : row.kind === "physical"
                      ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
                      : "rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                }
              >
                {displayJsonValue(row.kind)}
              </span>
            );
          },
        },
        { key: "phone", header: "Phone" },
        { key: "inn", header: "INN", render: (row) => displayJsonValue(row.inn) },
        { key: "rows", header: "Rows" },
        { key: "since", header: "Since" },
      ]),
    [],
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <DataTable
        title="Counterparties"
        data={counterparties}
        columns={columns}
        filters={filterConfigs}
        enableFilters
        enableSorting
        enableColumnToggle
        isLoading={isLoading}
        error={error}
        emptyState={
          <div className="space-y-2">
            <p className="text-base font-medium text-slate-700">
              No counterparties found
            </p>
            <p className="text-slate-500">
              No data matches the current filter set.
            </p>
          </div>
        }
      />
    </div>
  );
};
