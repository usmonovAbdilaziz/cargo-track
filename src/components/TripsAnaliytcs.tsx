import type { Counterparty } from "../types/counterparties";
import type { License } from "../types/licenses";
import type { Trip } from "../types/trips";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import { useEffect, useState } from "react";

interface TripsAnalyticsProps {
  data: Trip[];
  counterparties?: Counterparty[];
  licenses?: License[];
  header: boolean | false;
}

export const TripsAnalytics = (props: TripsAnalyticsProps) => {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  if (!props.data || props.data.length === 0) {
    return <div className="text-slate-700">No data available</div>;
  }

  const totalTrips = props.data.length;
  const totalWeight = props.data.reduce((acc, trip) => {
    const raw = String(trip.cargo?.weight_t ?? "0").replace(",", ".");
    const value = Number(raw);
    return acc + (Number.isFinite(value) ? value : 0);
  }, 0);
  const formattedTotalWeight = Number(totalWeight.toFixed(1));
  const totalCounterparties = props.counterparties?.length ?? 0;
  const totalLicenses = props.licenses?.length ?? 0;
  const totalCounterpartyRows =
    props.counterparties?.reduce((sum, item) => sum + (item.rows ?? 0), 0) ?? 0;
  const activeLicenses =
    props.licenses?.filter((license) => {
      const validTo = new Date(license.valid_to);
      return !Number.isNaN(validTo.getTime()) && validTo.getTime() > now;
    }).length ?? 0;

  const statusCounts = {
    DELIVERED: 0,
    PENDING: 0,
    IN_TRANSIT: 0,
    DISPUTED: 0,
    CANCELLED: 0,
    ARCHIVED_V2: 0,
  } as Record<string, number>;

  props.data.forEach((trip) => {
    const status = String(trip.status ?? "")
      .trim()
      .toUpperCase();
    if (status in statusCounts) {
      statusCounts[status] += 1;
    }
  });


 

  const tripStatusChart = {
    title: "Trips by status",
    color: "#2563eb",
    categories: ["Delivered", "Pending", "In transit", "Disputed", "Cancelled", "Archived"],
    data: [
      statusCounts.DELIVERED,
      statusCounts.PENDING,
      statusCounts.IN_TRANSIT,
      statusCounts.DISPUTED,
      statusCounts.CANCELLED,
      statusCounts.ARCHIVED_V2,
    ],
    total: totalTrips,
  };

  const counterpartiesByKindChart = {
    title: "Counterparties by kind",
    categories: Array.from(
      new Set((props.counterparties ?? []).map((counterparty) => counterparty.since)),
    ).sort(),
    series: [
      {
        name: "Legal",
        color: "#14b8a6",
        data: Array.from(
          new Set((props.counterparties ?? []).map((counterparty) => counterparty.since)),
        )
          .sort()
          .map((date) =>
            (props.counterparties ?? []).filter(
              (counterparty) => counterparty.since === date && counterparty.kind === "legal",
            ).length,
          ),
      },
      {
        name: "Physical",
        color: "#f59e0b",
        data: Array.from(
          new Set((props.counterparties ?? []).map((counterparty) => counterparty.since)),
        )
          .sort()
          .map((date) =>
            (props.counterparties ?? []).filter(
              (counterparty) => counterparty.since === date && counterparty.kind === "physical",
            ).length,
          ),
      },
    ],
    total: totalCounterparties,
  };

  const licensesChart = {
    title: "Licenses by vehicle kind",
    categories: ["power", "trailer"],
    series: [
      {
        name: "Power",
        color: "#8b5cf6",
        data: [
          (props.licenses ?? []).filter((license) => license.vehicle.kind === "power").length,
          0,
        ],
      },
      {
        name: "Trailer",
        color: "#f97316",
        data: [
          0,
          (props.licenses ?? []).filter((license) => license.vehicle.kind === "trailer").length,
        ],
      },
    ],
    total: totalLicenses,
  };

  const chartGroups = [tripStatusChart, counterpartiesByKindChart, licensesChart];

  const summaryCards = [
    {
      title: "Trips",
      value: totalTrips,
      subtitle: `${formattedTotalWeight.toFixed(1)} t total weight`,
      accent: "border-blue-200 bg-blue-50 text-blue-700",
    },
    {
      title: "Counterparties",
      value: totalCounterparties,
      subtitle: `${totalCounterpartyRows} rows total`,
      accent: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    {
      title: "Licenses",
      value: totalLicenses,
      subtitle: `${activeLicenses} active`,
      accent: "border-violet-200 bg-violet-50 text-violet-700",
    },
  ];

  const buildChartOptions = (chart: {
    title: string;
    color?: string;
    categories: string[];
    data?: number[];
    series?: Array<{ name: string; data: number[]; color: string }>;
  }) => ({
    chart: {
      type: "spline",
      backgroundColor: "#f8fafc",
      height: 260,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: chart.title,
      style: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#0f172a",
      },
    },
    xAxis: {
      categories: chart.categories,
      crosshair: {
        width: 1,
        color: "#94a3b8",
        dashStyle: "Dash",
      },
      title: {
        text: chart.title.includes("Trips") ? "Status" : "Date",
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "Count",
      },
    },
    tooltip: {
      shared: false,
      formatter: function (this: Highcharts.Point): string {
        return `
          <div style="min-width: 150px;">
            <div style="font-weight:700; margin-bottom:6px;">${this.category}</div>
            <div><span style="color:#475569">${chart.title}:</span> <b>${this.y}</b></div>
          </div>
        `;
      },
    },
    plotOptions: {
      series: {
        marker: {
          enabled: true,
          radius: 4,
        },
        dataLabels: {
          enabled: false,
        },
      },
    },
    series: chart.series ?? [
      {
        name: chart.title,
        data: chart.data ?? [],
        color: chart.color ?? "#2563eb",
      },
    ],
  });

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {props.header && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-800">
            Trips Analytics
          </h2>
        </div>
      )}

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-2xl border p-4 shadow-sm ${card.accent}`}
          >
            <p className="text-sm font-medium uppercase tracking-wide opacity-80">
              {card.title}
            </p>
            <div className="mt-3 text-3xl font-bold leading-none">
              {card.value}
            </div>
            <p className="mt-2 text-sm opacity-80">{card.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-2">
          {[chartGroups[0], chartGroups[1]].map((chart) => (
            <div
              key={chart.title}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  {chart.title}
                </span>
                <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
                  {chart.total}
                </span>
              </div>
              <HighchartsReact
                highcharts={Highcharts}
                options={buildChartOptions(chart)}
              />
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-1">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                {chartGroups[2].title}
              </span>
              <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
                {chartGroups[2].total}
              </span>
            </div>
            <HighchartsReact
              highcharts={Highcharts}
              options={buildChartOptions(chartGroups[2])}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
