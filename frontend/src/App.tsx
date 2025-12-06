import { useState, useEffect } from "react";
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
import { INITIAL_STUDENTS, MOCK_TRAINERS } from "./data/mockData";
import { ProtectedLayout } from "./components/layout/ProtectedLayout";

export default function App() {
  // Lifted state for data persistence
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [trainers, setTrainers] = useState(MOCK_TRAINERS);
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = (message: string, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Wrapper components to pass props (since Route element expects a ReactNode)
  const DashboardWrapper = () => {
    const { user } = useOutletContext<any>();
    return <DashboardView user={user} students={students} />;
  };

  const AnalyticsWrapper = () => {
    const { user } = useOutletContext<any>();
    return <AnalyticsView user={user} students={students} trainers={trainers} />;
  };

  const StudentsWrapper = () => {
    const { user } = useOutletContext<any>();
    return (
      <StudentsView
        user={user}
        students={students}
        setStudents={setStudents}
        trainers={trainers}
        setTrainers={setTrainers}
        addToast={addToast}
      />
    );
  };

  const TrainersWrapper = () => {
    const { user } = useOutletContext<any>();
    return (
      <TrainersView
        user={user}
        trainers={trainers}
        setTrainers={setTrainers}
        addToast={addToast}
        students={students}
      />
    );
  };

  const RegionsWrapper = () => {
    const { user } = useOutletContext<any>();
    return <RegionsView user={user} students={students} trainers={trainers} />;
  };

  const FinanceWrapper = () => {
    const { user } = useOutletContext<any>();
    return <FinanceView user={user} students={students} />;
  };

  const SafetyWrapper = () => {
    const { user } = useOutletContext<any>();
    return <SafetyView user={user} />;
  };

  const CoursesWrapper = () => {
    const { user } = useOutletContext<any>();
    return <CoursesView user={user} />;
  };

  const SettingsWrapper = () => {
    const { user } = useOutletContext<any>();
    return <SettingsView user={user} />;
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
          <Route path="/finance" element={<FinanceWrapper />} />
          <Route path="/safety" element={<SafetyWrapper />} />
          <Route path="/courses" element={<CoursesWrapper />} />
          <Route path="/settings" element={<SettingsWrapper />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}