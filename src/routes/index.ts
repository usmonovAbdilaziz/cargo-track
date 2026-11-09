import { createElement, type ReactElement, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { FileText, TruckElectric, Users } from "lucide-react";

import { Licenses } from "../pages/Licenses/licenses";
import { Trips } from "../pages/Trips/trips";
import { Counterparties } from "../pages/Counterparties/couterparties";
import { Login } from "../auth/Login";

export type AppRoute = {
  label: string;
  path: string;
  icon?: ReactNode;
  element: ReactElement;
};

export const routes: AppRoute[] = [
  {
    label: "Trips",
    path: "/",
    icon: createElement(TruckElectric, { className: "h-4 w-4" }),
    element: createElement(Navigate, { to: "/auth", replace: true }),
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