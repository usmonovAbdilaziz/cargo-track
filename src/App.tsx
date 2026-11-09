
import { useState } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { Bodies } from "./utils/body";
import { Header } from "./utils/header";
import { Sidebar } from "./utils/sidebar";

function AppShell() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  if (!isAuthenticated && location.pathname !== "/auth") {
    window.location.href = "/auth";
  }
  const isAuthRoute = location.pathname === "/auth";

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      {!isAuthRoute && (
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
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
