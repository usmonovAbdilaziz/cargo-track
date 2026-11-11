import { useMemo } from "react";
import { LogistikaService } from "../../services/LogisticanServices";
import type { Trip } from "../../types/trips";
import { createTableColumns, DataTable, type TableFilterConfig } from "../../ui/table";

export const Trips = () => {
  const trips = new LogistikaService();
  const { data: tripsResponse, isLoading, error } = trips.useTripsData();
  const tripsData = tripsResponse?.items ?? [];

  const columns = useMemo(
    () =>
      createTableColumns<Trip>([
        { key: "id", header: "ID" },
        {
          key: "cargo.name",
          header: "Cargo",
          children: (row) => (
            <div className="space-y-1">
              <div className="font-medium text-slate-800">{row.cargo?.name ?? "-"}</div>
              <div className="text-xs text-slate-500">{row.cargo?.weight_t ?? 0} t</div>
            </div>
          ),
        },
        {
          key: "route.from",
          header: "Route",
          children: (row) => (
            <div className="space-y-1">
              <div className="font-medium text-slate-800">
                {row.route?.from ?? "-"} → {row.route?.to ?? "-"}
              </div>
              <div className="text-xs text-slate-500">
                {row.route?.from_country ?? "-"} → {row.route?.to_country ?? "-"}
              </div>
            </div>
          ),
        },
        {
          key: "created_at",
          header: "Created At",
          children: (row) => (
            <span className="text-slate-700">
              {row.created_at ? new Date(row.created_at).toLocaleString() : "-"}
            </span>
          ),
        },
        {
          key: "driver.id",
          header: "Driver",
          children: (row) => (
            <div className="space-y-1">
              <div className="font-medium text-slate-800">{row.driver?.name ?? "-"}</div>
              <div className="text-xs text-slate-500">{row.driver?.id ?? "-"}</div>
            </div>
          ),
        },
        {
          key: "status",
          header: "Status",
          children: (row) => (
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                row.status === "DISPUTED"
                  ? "bg-red-100 text-red-700"
                  : row.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : row.status === "IN_PROGRESS"
                      ? "bg-yellow-100 text-yellow-700"
                      : row.status === "CANCELLED"
                        ? "bg-slate-200 text-slate-700"
                        : "bg-blue-100 text-blue-700"
              }`}
            >
              {row.status}
            </span>
          ),
        },
      ]),
    [],
  );

  const filterConfigs = useMemo<TableFilterConfig<Trip>[]>(
    () => [
      { key: "id", label: "ID", type: "text" },
      { key: "route.from", label: "Origin", type: "text" },
      { key: "route.to", label: "Destination", type: "text" },
      { key: "created_at", label: "Created At", type: "date" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: Array.from(
          new Set(
            (Array.isArray(tripsData) ? tripsData : [])
              .map((trip) =>
                typeof trip?.status === "string" ? trip.status.trim() : "",
              )
              .filter((status): status is string => Boolean(status)),
          ),
        )
          .sort((a, b) => a.localeCompare(b))
          .map((status) => ({
            value: status,
            label: status.replace(/_/g, " "),
          })),
      },
    ],
    [tripsData],
  );

  return (
    <div className="w-full">
      <DataTable
        title="Trips"
        data={tripsData}
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
              No trips found
            </p>
            <p className="text-slate-500">
              Try changing the filters or come back later.
            </p>
          </div>
        }
      />
    </div>
  );
};
