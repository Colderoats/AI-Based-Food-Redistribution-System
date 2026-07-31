import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import InputField from "../../components/InputField";
import PasswordInput from "../../components/PasswordInput";
import PrimaryButton from "../../components/PrimaryButton";
import PasswordStrength from "../../components/PasswordStrength";
import { useNavigate } from "react-router-dom";
function NGOAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ngoName: "",
    registrationNumber: "",
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

 const handleSubmit = (e) => {
  e.preventDefault();

  console.log("NGO Login", formData);

  // Temporary navigation
  navigate("/ngo/dashboard");

  // Later replace with API call
};

  return (
    <AuthLayout
      title="NGO Portal"
      subtitle={
        isLogin
          ? "Sign in to access available food donations"
          : "Register your NGO"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {!isLogin && (
          <InputField
            label="NGO Name"
            type="text"
            name="ngoName"
            placeholder="Enter NGO name"
            value={formData.ngoName}
            onChange={handleChange}
          />
        )}

        {!isLogin && (
          <InputField
            label="Registration Number"
            type="text"
            name="registrationNumber"
            placeholder="Enter NGO registration number"
            value={formData.registrationNumber}
            onChange={handleChange}
          />
        )}

        <InputField
          label="Email"
          type="email"
          name="email"
          placeholder="ngo@example.com"
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
            label="Address"
            type="text"
            name="address"
            placeholder="Enter NGO address"
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

export default NGOAuth;