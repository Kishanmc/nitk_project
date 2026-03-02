import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import DoctorLogin from './pages/DoctorLogin';
import PatientLogin from './pages/PatientLogin';
import ResearcherLogin from './pages/ResearcherLogin';
import DoctorDashboard from './dashboards/DoctorDashboard';
import PatientDashboard from './dashboards/PatientDashboard';
import ResearcherDashboard from './dashboards/ResearcherDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/doctor/login" replace />} />

      <Route path="/doctor/login" element={<DoctorLogin />} />
      <Route path="/patient/login" element={<PatientLogin />} />
      <Route path="/researcher/login" element={<ResearcherLogin />} />

      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute role="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute role="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/researcher/dashboard"
        element={
          <ProtectedRoute role="researcher">
            <ResearcherDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/doctor/login" replace />} />
    </Routes>
  );
}
