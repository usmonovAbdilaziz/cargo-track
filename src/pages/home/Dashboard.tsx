import { useCounterpartiesData, useLicenseData, useTripsData } from "../../services/LogisticanServices";
import { lazy } from "react";

const TripsAnalyticsLazy = lazy(() => import("../../components/TripsAnaliytcs").then((module) => ({ default: module.TripsAnalytics })));

export const Dashboard = () => {
    const { data: tripsResponse } = useTripsData();
    const { data: licensesResponse } = useLicenseData();
    const { data: counterparties = [] } = useCounterpartiesData();
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
