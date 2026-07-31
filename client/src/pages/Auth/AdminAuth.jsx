import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import InputField from "../../components/InputField";
import PasswordInput from "../../components/PasswordInput";
import PrimaryButton from "../../components/PrimaryButton";
import { useNavigate } from "react-router-dom";
function AdminAuth() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
const handleSubmit = (e) => {
  e.preventDefault();

  console.log("Admin Login", formData);

  // Temporary navigation
  navigate("/admin/dashboard");

  // Later replace with API call
};

  return (
    <AuthLayout
      title="Administrator"
      subtitle="Platform Management Portal"
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        <InputField
          label="Admin Email"
          type="email"
          name="email"
          placeholder="admin@example.com"
          value={formData.email}
          onChange={handleChange}
        />

        <PasswordInput
          label="Password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />

        <PrimaryButton type="submit">
          Login
        </PrimaryButton>

      </form>
    </AuthLayout>
  );
}

export default AdminAuth;