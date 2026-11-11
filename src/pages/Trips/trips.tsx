import { useMemo } from "react";
import { useTripsData } from "../../services/LogisticanServices";
import type { Trip } from "../../types/trips";
import { DataTable, type TableFilterConfig } from "../../ui/table";
import { createTableColumns } from "../../ui/table-columns";
import { displayJsonValue } from "../../utils/json-records";

const EMPTY_TRIPS: Trip[] = [];
const TRAILING_COLUMNS = ["created_at", "status"];

export const Trips = () => {
  const { data: tripsResponse, isLoading, error } = useTripsData();
  const tripsData = tripsResponse?.items ?? EMPTY_TRIPS;

  const columns = useMemo(
    () =>
      createTableColumns<Trip>([
        { key: "id", header: "ID" },
       
        {
          key: "created_at",
          header: "Created At",
          children: (row) => (
            <span className="text-slate-700">
              {typeof row.created_at === "string" && !Number.isNaN(new Date(row.created_at).getTime())
                ? new Date(row.created_at).toLocaleString()
                : displayJsonValue(row.created_at)}
            </span>
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
              {displayJsonValue(row.status)}
            </span>
          ),
        },
      ]),
    [],
  );

  const filterConfigs = useMemo<TableFilterConfig<Trip>[]>(
    () => [
      { key: "id", label: "ID", type: "text" },
      { key: "cargo.name", label: "Cargo", type: "text" },
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
        trailingColumnKeys={TRAILING_COLUMNS}
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
