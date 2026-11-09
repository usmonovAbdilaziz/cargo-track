import { useMemo } from "react";
import { LogistikaService } from "../../services/LogisticanServices";
import type { Counterparty } from "../../types/counterparties";
import { createTableColumns, DataTable } from "../../ui/table";

export const Counterparties = () => {
  const service = new LogistikaService();
  const { data: counterparties = [] } = service.useCountriesData();

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
        options: [
          { value: "all", label: "Barchasi" },
          { value: "legal", label: "Legal" },
          { value: "physical", label: "Physical" },
        ],
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
    [],
  );

  const columns = useMemo(
    () =>
      createTableColumns<Counterparty>([
        { key: "name", header: "Name" },
        {
          key: "kind",
          header: "Kind",
          render: (row) => {
            const isLegal = row.kind === "legal";

            return (
              <span
                className={
                  isLegal
                    ? "rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                    : "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
                }
              >
                {row.kind}
              </span>
            );
          },
        },
        { key: "phone", header: "Phone" },
        { key: "inn", header: "INN", render: (row) => row.inn ?? "-" },
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
      />
    </div>
  );
};
