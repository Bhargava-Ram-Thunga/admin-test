import { useState } from "react";
import { Routes, Route, Navigate, useOutletContext } from "react-router-dom";
import { Toast } from "./components/ui/Toast";
import { Login } from "./pages/Login";
import { DashboardView } from "./pages/DashboardView";
import { AnalyticsView } from "./pages/AnalyticsView";
import { StudentsView } from "./pages/StudentsView";
import { TrainersView } from "./pages/TrainersView";
import { RegionsView } from "./pages/RegionsView";
import { FinanceView } from "./pages/FinanceView";
import { SafetyView } from "./pages/SafetyView";
import { CoursesView } from "./pages/CoursesView";
import { SettingsView } from "./pages/SettingsView";
import { AuditLogView } from "./pages/AuditLogView";
import { AllocationsView } from "./pages/AllocationsView";
import { SessionsView } from "./pages/SessionsView";
import {
  ProtectedLayout,
  type AuthContextType,
} from "./components/layout/ProtectedLayout";
import type { ToastData } from "./types";

export default function App() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (message: string, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const DashboardWrapper = () => {
    const { user } = useOutletContext<AuthContextType>();
    return <DashboardView user={user} />;
  };

  const AnalyticsWrapper = () => {
    const { user } = useOutletContext<AuthContextType>();
    return <AnalyticsView user={user} />;
  };

  const StudentsWrapper = () => {
    const { user } = useOutletContext<AuthContextType>();
    return <StudentsView user={user} addToast={addToast} />;
  };

  const TrainersWrapper = () => {
    const { user } = useOutletContext<AuthContextType>();
    return <TrainersView user={user} addToast={addToast} />;
  };

  const RegionsWrapper = () => {
    const { user } = useOutletContext<AuthContextType>();
    return <RegionsView user={user} />;
  };

  const FinanceWrapper = () => {
    const { user } = useOutletContext<AuthContextType>();
    return <FinanceView user={user} />;
  };

  const SafetyWrapper = () => {
    const { user } = useOutletContext<AuthContextType>();
    return <SafetyView user={user} />;
  };

  const CoursesWrapper = () => {
    const { user } = useOutletContext<AuthContextType>();
    return <CoursesView user={user} />;
  };

  const SettingsWrapper = () => {
    const { user } = useOutletContext<AuthContextType>();
    return <SettingsView user={user} addToast={addToast} />;
  };

  const AuditLogWrapper = () => {
    const { user } = useOutletContext<AuthContextType>();
    return <AuditLogView user={user} />;
  };

  // New Wrappers
  const AllocationsWrapper = () => {
    const { user } = useOutletContext<AuthContextType>();
    return <AllocationsView user={user} addToast={addToast} />;
  };

  const SessionsWrapper = () => {
    const { user } = useOutletContext<AuthContextType>();
    return <SessionsView user={user} addToast={addToast} />;
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardWrapper />} />
          <Route path="/analytics" element={<AnalyticsWrapper />} />
          <Route path="/students" element={<StudentsWrapper />} />
          <Route path="/trainers" element={<TrainersWrapper />} />
          <Route path="/regions" element={<RegionsWrapper />} />
          <Route path="/allocations" element={<AllocationsWrapper />} />
          <Route path="/sessions" element={<SessionsWrapper />} />
          <Route path="/finance" element={<FinanceWrapper />} />
          <Route path="/safety" element={<SafetyWrapper />} />
          <Route path="/courses" element={<CoursesWrapper />} />
          <Route path="/audit" element={<AuditLogWrapper />} />
          <Route path="/settings" element={<SettingsWrapper />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
