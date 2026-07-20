import type { ReactElement } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { TabBar } from "./components/TabBar";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { RecordPage } from "./pages/RecordPage";
import { FollowUpPage } from "./pages/FollowUpPage";
import { SummaryPage } from "./pages/SummaryPage";
import { EntriesPage } from "./pages/EntriesPage";
import { InsightsPage } from "./pages/InsightsPage";
import { SettingsPage } from "./pages/SettingsPage";

function RequireAuth({ children }: { children: ReactElement }) {
  const { user, loading, hasConsented } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page">Загрузка...</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!hasConsented && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

function AppShell() {
  const { user, hasConsented } = useAuth();
  const showTabBar = Boolean(user && hasConsented);

  return (
    <div className="app-shell">
      <main className="app-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/onboarding"
            element={
              <RequireAuth>
                <OnboardingPage />
              </RequireAuth>
            }
          />
          <Route
            path="/"
            element={
              <RequireAuth>
                <RecordPage />
              </RequireAuth>
            }
          />
          <Route
            path="/follow-up/:id"
            element={
              <RequireAuth>
                <FollowUpPage />
              </RequireAuth>
            }
          />
          <Route
            path="/summary/:id"
            element={
              <RequireAuth>
                <SummaryPage />
              </RequireAuth>
            }
          />
          <Route
            path="/entries"
            element={
              <RequireAuth>
                <EntriesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/insights"
            element={
              <RequireAuth>
                <InsightsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showTabBar && <TabBar />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
