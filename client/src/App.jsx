import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/Landing/LandingPage";

import BusinessAuth from "./pages/Auth/BusinessAuth";
import NGOAuth from "./pages/Auth/NGOAuth";
import AdminAuth from "./pages/Auth/AdminAuth";

import BusinessDashboard from "./pages/Business/Dashboard";
import NGODashboard from "./pages/NGO/Dashboard";
import AdminDashboard from "./pages/Admin/Dashboard";
import Inventory from "./pages/Business/Inventory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/business/login" element={<BusinessAuth />} />
        <Route path="/ngo/login" element={<NGOAuth />} />
        <Route path="/admin/login" element={<AdminAuth />} />

        <Route
          path="/business/dashboard"
          element={<BusinessDashboard />}
        />
        <Route
  path="/business/inventory"
  element={<Inventory />}
/>
        <Route
          path="/ngo/dashboard"
          element={<NGODashboard />}
        />
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;