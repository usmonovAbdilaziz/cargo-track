import { createElement, type ReactElement, type ReactNode } from "react";
import { FileText, SlidersHorizontal, TruckElectric, Users } from "lucide-react";

import { Licenses } from "../pages/Licenses/licenses";
import { Trips } from "../pages/Trips/trips";
import { Counterparties } from "../pages/Counterparties/couterparties";
import { Login } from "../auth/Login";
import { Dashboard } from "../pages/home/Dashboard";

export type AppRoute = {
  label: string;
  path: string;
  icon?: ReactNode;
  element: ReactElement;
};

export const routes: AppRoute[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: createElement(SlidersHorizontal, { className: "h-4 w-4" }),
    element: createElement(Dashboard),
  },
  {
    label: "Login",
    path: "/auth",
    icon: createElement(TruckElectric, { className: "h-4 w-4" }),
    element: createElement(Login),
  },
  {
    label: "Trips",
    path: "/trips",
    icon: createElement(TruckElectric, { className: "h-4 w-4" }),
    element: createElement(Trips),
  },
  {
    label: "Counterparties",
    path: "/counterparties",
    icon: createElement(Users, { className: "h-4 w-4" }),
    element: createElement(Counterparties),
  },
  {
    label: "Licenses",
    path: "/licenses",
    icon: createElement(FileText, { className: "h-4 w-4" }),
    element: createElement(Licenses),
  },
];