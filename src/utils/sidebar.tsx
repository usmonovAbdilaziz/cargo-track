import { NavLink } from "react-router-dom";
import { routes } from "../routes";
import { ArrowRight } from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
};

export const Sidebar = ({ isOpen }: SidebarProps) => {
  return (
    <aside
      className={`${isOpen ? "w-16 md:w-64" : "w-16 md:w-20"} shrink-0 bg-slate-100 text-slate-800 transition-all duration-200`}
    >
      <nav className="h-full border-r border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-3 py-4">
          {routes
            .filter((route) => route.path !== "/auth")
            .map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                aria-label={route.label}
                className={({ isActive }) =>
                  `group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                    isActive ?
                      "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-200"
                  } ${!isOpen ? "justify-center" : ""}`
                }
              >
                {route.icon}
                {isOpen && <span className="hidden md:inline">{route.label}</span>}

                <ArrowRight
                  className={`hidden h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:block ${
                    !isOpen ? "absolute right-2" : "ml-auto"
                  }`}
                />
              </NavLink>
            ))}
        </div>
      </nav>
    </aside>
  );
};
