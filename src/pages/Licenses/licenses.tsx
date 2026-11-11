import { useMemo } from "react";
import { useLicenseData } from "../../services/LogisticanServices";
import type { License } from "../../types/licenses";
import { DataTable, type TableFilterConfig } from "../../ui/table";
import { createTableColumns } from "../../ui/table-columns";

export const Licenses = () => {
  const { data: licenseResponse, isLoading, error } = useLicenseData();
  const licenses = licenseResponse?.data?.licenses ?? [];

  const filterConfigs = useMemo<TableFilterConfig<License>[]>(
    () => [
      { key: "id", label: "ID", type: "text" },
      { key: "series", label: "Series", type: "text" },
      { key: "number", label: "Number", type: "text" },
      { key: "owner.name", label: "Owner Name", type: "text" },
      { key: "owner.address", label: "Owner Address", type: "text" },
      { key: "vehicle.plate", label: "Vehicle Plate", type: "text" },
      { key: "vehicle.kind", label: "Vehicle Kind", type: "text" },
      { key: "vehicle.model", label: "Vehicle Model", type: "text" },
      { key: "driver.name", label: "Driver Name", type: "text" },
      { key: "valid_to", label: "Valid To", type: "date" },
      { key: "issuer", label: "Issuer", type: "text" },
    ],
    [],
  );

  const columns = useMemo(
    () =>
      createTableColumns<License>([
        { key: "id", header: "ID" },
        { key: "series", header: "Series" },
        { key: "number", header: "Number" },
        { key: "owner.name", header: "Owner Name" },
        { key: "owner.address", header: "Owner Address" },
        { key: "vehicle.plate", header: "Vehicle Plate" },
        { key: "vehicle.kind", header: "Vehicle Kind" },
        { key: "vehicle.model", header: "Vehicle Model" },
        { key: "driver.name", header: "Driver Name" },
        { key: "valid_to", header: "Valid To" },
        { key: "issuer", header: "Issuer" },
      ]),
    [],
  );

  return (
    <div className="flex items-center justify-center">
      <DataTable
        title="Licenses"
        data={licenses}
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
              No licenses found
            </p>
            <p className="text-slate-500">
              There are no license records for the current filters.
            </p>
          </div>
        }
      />
    </div>
  );
};
