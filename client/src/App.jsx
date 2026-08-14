import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";


import AdminAuth from "./pages/Auth/AdminAuth";
import Auth from "./pages/Auth/Auth";

import BusinessDashboard from "./pages/Business/Dashboard";
import NGODashboard from "./pages/NGO/Dashboard";
import AdminDashboard from "./pages/Admin/Dashboard";
import Inventory from "./pages/Business/Inventory";
import Surplus from "./pages/Business/Surplus";
import Requests from "./pages/NGO/Requests";
import AvailableFood from "./pages/NGO/AvailableFood";
import Partners from "./pages/Shared/Partners";
import Profile from "./pages/Shared/Profile";
import Overview from "./pages/Shared/Overview";
import ExpiryAlerts from "./pages/Business/ExpiryAlerts";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />

        <Route path="/auth" element={<Auth />} />
        <Route path="/business/login" element={<Navigate to="/auth?role=business" replace />} />
        <Route path="/ngo/login" element={<Navigate to="/auth?role=ngo" replace />} />
        <Route path="/admin/login" element={<AdminAuth />} />

        <Route
          path="/business/dashboard"
          element={<BusinessDashboard />}
        />
        <Route
  path="/business/inventory"
          element={<Inventory />}
/>
        <Route path="/business/surplus" element={<Surplus />} />
        <Route path="/business/expiry-alerts" element={<ExpiryAlerts />} />
        <Route path="/business/overview" element={<Overview />} />
        <Route path="/business/partners" element={<Partners />} />
        <Route path="/business/profile" element={<Profile />} />
        <Route path="/business/requests" element={<Requests />} />
        <Route
          path="/ngo/dashboard"
          element={<NGODashboard />}
        />
        <Route path="/ngo/requests" element={<Requests />} />
        <Route path="/ngo/overview" element={<Overview />} />
        <Route path="/ngo/partners" element={<Partners />} />
        <Route path="/ngo/profile" element={<Profile />} />
        <Route path="/ngo/available-food" element={<AvailableFood />} />
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
