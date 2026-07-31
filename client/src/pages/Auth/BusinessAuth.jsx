import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";
import InputField from "../../components/InputField";
import PasswordInput from "../../components/PasswordInput";
import PrimaryButton from "../../components/PrimaryButton";
import PasswordStrength from "../../components/PasswordStrength";
import RoleSelector from "../../components/RoleSelector";

function BusinessAuth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        // LOGIN
        const response = await axios.post(
          "http://localhost:5000/api/business/login",
          {
            email: formData.email,
            password: formData.password,
          }
        );

        // Save JWT Token
        localStorage.setItem("token", response.data.token);

        alert("Login Successful!");

        navigate("/business/dashboard");
      } else {
        // Basic validation
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match.");
          return;
        }

        // REGISTER
        const response = await axios.post(
          "http://localhost:5000/api/business/register",
          {
            business_name: formData.businessName,
            business_type: formData.businessType,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            password: formData.password,
          }
        );

        alert(response.data.message);

        // Clear form
        setFormData({
          businessName: "",
          businessType: "",
          email: "",
          phone: "",
          address: "",
          password: "",
          confirmPassword: "",
        });

        // Switch to login page
        setIsLogin(true);
      }
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <AuthLayout
      title="Food Business"
      subtitle={
        isLogin
          ? "Sign in to manage your inventory"
          : "Register your food business"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <InputField
            label="Business Name"
            type="text"
            name="businessName"
            placeholder="Enter business name"
            value={formData.businessName}
            onChange={handleChange}
          />
        )}

        {!isLogin && (
          <RoleSelector
            value={formData.businessType}
            onChange={handleChange}
          />
        )}

        <InputField
          label="Email"
          type="email"
          name="email"
          placeholder="business@example.com"
          value={formData.email}
          onChange={handleChange}
        />

        {!isLogin && (
          <InputField
            label="Phone Number"
            type="tel"
            name="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleChange}
          />
        )}

        {!isLogin && (
          <InputField
            label="Business Address"
            type="text"
            name="address"
            placeholder="Enter business address"
            value={formData.address}
            onChange={handleChange}
          />
        )}

        <PasswordInput
          label="Password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
        />

        {!isLogin && (
          <>
            <PasswordStrength password={formData.password} />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </>
        )}

        <PrimaryButton type="submit">
          {isLogin ? "Login" : "Register"}
        </PrimaryButton>

        <p className="text-center text-gray-400">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

export default BusinessAuth;