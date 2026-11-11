
import { useEffect, useState } from "react";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { readAuthSession } from "./auth/session";
import { Bodies } from "./utils/body";
import { Header } from "./utils/header";
import { Sidebar } from "./utils/sidebar";

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => readAuthSession().isAuthenticated,
  );

  useEffect(() => {
    const syncAuth = () => {
      setIsAuthenticated(readAuthSession().isAuthenticated);
    };

    syncAuth();
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  useEffect(() => {
    const session = readAuthSession();

    if (!session.isAuthenticated && location.pathname !== "/auth") {
      navigate("/auth", { replace: true });
      return;
    }

    if (session.isAuthenticated && location.pathname === "/auth") {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  const isAuthRoute = location.pathname === "/auth";

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      {!isAuthRoute && (
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          isAuthenticated={isAuthenticated}
        />
      )}

      <div className="flex flex-1 flex-row">
        {!isAuthRoute && <Sidebar isOpen={isSidebarOpen} />}
        <Bodies />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
