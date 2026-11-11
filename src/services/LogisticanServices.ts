import { useQuery } from "@tanstack/react-query";
import type { TripResponse } from "../types/trips";
import type { LicenseResponse } from "../types/licenses";
import type { Counterparty } from "../types/counterparties";
import tripsUrl from "../../data/trips.json?url";
import licensesUrl from "../../data/licenses.json?url";
import counterpartiesUrl from "../../data/counterparties.json?url";

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
      queryFn: () => readJsonFile<TripResponse>(TRIPS_DATA),
    });
  }

  useLicenseData() {
    return useQuery<LicenseResponse>({
      queryKey: [LICENSE_DATA],
      queryFn: () => readJsonFile<LicenseResponse>(LICENSE_DATA),
    });
  }

  useCountriesData() {
    return useQuery<Counterparty[]>({
      queryKey: [COUNTERPARTIES_DATA],
      queryFn: () => readJsonFile<Counterparty[]>(COUNTERPARTIES_DATA),
    });
  }
}

