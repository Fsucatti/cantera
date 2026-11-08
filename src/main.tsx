import "@fontsource-variable/manrope";
import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SessionProvider, useSession } from "./lib/session";
import { Auth } from "./pages/Auth";
import { GamePage } from "./pages/Games";
import { Home } from "./pages/Home";
import { Inbox } from "./pages/Inbox";
import { JobDetail, Jobs } from "./pages/Jobs";
import { NotFound } from "./pages/NotFound";
import { People } from "./pages/People";
import { Settings } from "./pages/Settings";
import { TeamPage, Teams } from "./pages/Teams";
import { Shell } from "./ui/Shell";

function App() {
  const { user, ready } = useSession();
  if (!ready) return <div className="splash" aria-label="Loading" />;
  if (!user) {
    return (
      <Routes>
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="*" element={<Auth mode="login" />} />
      </Routes>
    );
  }
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="games/:id" element={<GamePage />} />
        <Route path="teams" element={<Teams />} />
        <Route path="teams/:id" element={<TeamPage />} />
        <Route path="people" element={<People />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="inbox/:personId" element={<Inbox />} />
        <Route path="settings" element={<Navigate to="/settings/profile" replace />} />
        <Route path="settings/:section" element={<Settings />} />
        <Route path="login" element={<Navigate to="/" replace />} />
        <Route path="signup" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <App />
      </SessionProvider>
    </BrowserRouter>
  </StrictMode>,
);
