import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession, readAuthSession } from "../auth/session";

type HeaderProps = {
  isSidebarOpen: boolean;
  onToggle: () => void;
};

export const Header = ({
  isSidebarOpen,
  onToggle,
}: HeaderProps) => {
  const navigate = useNavigate();
  const [session, setSession] = useState(readAuthSession);

  useEffect(() => {
    const syncAuth = () => {
      setSession(readAuthSession());
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="flex h-20 items-center justify-between bg-gray-200 px-4">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-800 sm:text-3xl">CargoTrack</h1>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md p-2 hover:bg-gray-300"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ?
            <PanelLeftClose className="h-5 w-5 text-gray-600" />
          : <PanelLeftOpen className="h-5 w-5 text-gray-600" />}
        </button>
      </div>

      <div className="relative z-10 flex items-center gap-3">
        {session.isAuthenticated && (
          <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <span className="hidden text-sm font-medium text-slate-700 sm:block">
              {session.email ?? "Signed in"}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Logout <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
