import { useQuery } from "@tanstack/react-query";
import type {  TripResponse } from "../types/trips";
import type { LicenseResponse } from "../types/licenses";
import type { Counterparty } from "../types/counterparties";

const TRIPS_DATA = "data/trips.json";
const LICENSE_DATA = "data/licenses.json";
const COUNTERPARTIES_DATA = "data/counterparties.json";

export class LogistikaService {
  useTripsData() {
    return useQuery<TripResponse>({
      queryKey: [TRIPS_DATA],
      queryFn: () => fetch(TRIPS_DATA).then((res) => res.json()),
    });
  }

  useLicenseData() {
    return useQuery<LicenseResponse>({
      queryKey: [LICENSE_DATA],
      queryFn: () => fetch(LICENSE_DATA).then((res) => res.json()),
    });
  }

  useCountriesData() {
    return useQuery<Counterparty[]>({
      queryKey: [COUNTERPARTIES_DATA],
      queryFn: () => fetch(COUNTERPARTIES_DATA).then((res) => res.json()),
    });
  }
}

