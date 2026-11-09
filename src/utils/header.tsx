import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";

type HeaderProps = {
  isSidebarOpen: boolean;
  onToggle: () => void;
};

export const Header = ({ isSidebarOpen, onToggle }: HeaderProps) => {
  const [auth, setAuth] = useState(false);

  const toggleAuth = () => {
    setAuth((prev) => !prev);
  };

  return (
    <div className="flex h-20 items-center justify-between bg-gray-200 px-4">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-gray-800">CargoTrack</h1>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md p-2 hover:bg-gray-300"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5 text-gray-600" />
          ) : (
            <PanelLeftOpen className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-end">
        <button
          type="button"
          onClick={toggleAuth}
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          {auth ? "Close" : "Login"}
        </button>

        {auth && (
          <div className="absolute right-0 top-full mt-2 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("isAuthenticated", "false");
                setAuth(false);
              }}
              className="rounded bg-red-500 px-2 py font-bold text-white hover:bg-red-700"
            >
              Logout <LogOut />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
