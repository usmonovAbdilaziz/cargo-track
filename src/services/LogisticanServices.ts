import { useQuery } from "@tanstack/react-query";
import type { TripResponse } from "../types/trips";
import type { LicenseResponse } from "../types/licenses";
import type { Counterparty } from "../types/counterparties";
import tripsUrl from "../../data/trips.json?url";
import licensesUrl from "../../data/licenses.json?url";
import counterpartiesUrl from "../../data/counterparties.json?url";
import { extractRecords } from "../utils/json-records";

const TRIPS_DATA = tripsUrl;
const LICENSE_DATA = licensesUrl;
const COUNTERPARTIES_DATA = counterpartiesUrl;

const readJsonFile = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to load ${url}: ${response.status} ${response.statusText}`,
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(`Invalid JSON returned while loading ${url}.`);
  }
};

export class LogistikaService {
  useTripsData() {
    return useQuery<TripResponse>({
      queryKey: [TRIPS_DATA],
      queryFn: async () => ({
        items: extractRecords(await readJsonFile<unknown>(TRIPS_DATA), [["items"]]),
      }),
    });
  }

  useLicenseData() {
    return useQuery<LicenseResponse>({
      queryKey: [LICENSE_DATA],
      queryFn: async () => ({
        data: { licenses: extractRecords(await readJsonFile<unknown>(LICENSE_DATA), [["data", "licenses"]]) },
      }),
    });
  }

  useCountriesData() {
    return useQuery<Counterparty[]>({
      queryKey: [COUNTERPARTIES_DATA],
      queryFn: async () => extractRecords(await readJsonFile<unknown>(COUNTERPARTIES_DATA), []),
    });
  }
}

