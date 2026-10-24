

import StudentInfoPage from "./frontend/pages/StudentInfoPage";
import LoginPage from "./frontend/pages/login";
import RegisterPage from "./frontend/pages/register";
import StudentDashboard from "./frontend/pages/studentDashboard";
import StudentLayout from "./frontend/layout/StudentLayout";
import UploadCertificate from "./frontend/Components/UploadCertificate";
import CertificateHistory from "./frontend/Components/CertificateHistory";
import FacultyDashboard from "./frontend/pages/FacultyDashboard";
import StudentEdit from "./frontend/Components/studentEdit"
import AdminDashboard from "./frontend/pages/adminDashboard";
import { Route, Routes, Navigate } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
          <Route
      path="/admin-dashboard"
      element={<AdminDashboard />}
    />
      {/* Separate Student Dashboard — no shared layout */}
      <Route
        path="/studentDashboard"
        element={<StudentDashboard />}
      />

      {/* Student pages with shared header and sidebar */}
      <Route element={<StudentLayout />}>
        <Route path="/studentHome" element={<StudentInfoPage />} />
        <Route path="/studentEdit" element={<StudentEdit/>} />
        <Route
          path="/uploadCertificate"
          element={<UploadCertificate />}
        />
        <Route path="/history" element={<CertificateHistory />} />
      </Route>

      {/* Separate Faculty Dashboard */}
      <Route
        path="/facultyDashboard"
        element={<FacultyDashboard />}
      />

      
    </Routes>
  );
}

export default App;
