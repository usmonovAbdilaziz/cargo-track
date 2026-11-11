import { LogistikaService } from "../../services/LogisticanServices";
import { lazy } from "react";

const TripsAnalyticsLazy = lazy(() => import("../../components/TripsAnaliytcs").then((module) => ({ default: module.TripsAnalytics })));

export const Dashboard = () => {
    const logistikaService = new LogistikaService();
    const { data: tripsResponse } = logistikaService.useTripsData();
    const { data: licensesResponse } = logistikaService.useLicenseData();
    const { data: counterparties = [] } = logistikaService.useCountriesData();
    const tripsData = tripsResponse?.items ?? [];
    const licensesData = licensesResponse?.data?.licenses ?? [];

    return (
        <div className="flex flex-col gap-4">
            <TripsAnalyticsLazy
                data={tripsData}
                counterparties={counterparties}
                licenses={licensesData}
                header={true}
            />
        </div>
    )
}