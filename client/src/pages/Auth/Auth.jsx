import { useState } from "react";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";
import InputField from "../../components/InputField";
import PasswordInput from "../../components/PasswordInput";
import PasswordStrength from "../../components/PasswordStrength";
import RoleSelector from "../../components/RoleSelector";

const initialForm = {
  role: "business",
  name: "",
  businessType: "",
  registrationNumber: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
};

function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "register");
  const [formData, setFormData] = useState({
    ...initialForm,
    role: searchParams.get("role") === "ngo" ? "ngo" : "business",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const switchMode = () => {
    setError("");
    setIsLogin((current) => !current);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const isBusiness = formData.role === "business";
    const endpoint = isLogin
      ? "http://localhost:5000/api/auth/login"
      : `http://localhost:5000/api/${isBusiness ? "business" : "ngo"}/register`;
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : isBusiness
        ? {
            business_name: formData.name,
            business_type: formData.businessType,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            password: formData.password,
          }
        : {
            ngo_name: formData.name,
            registration_number: formData.registrationNumber,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            password: formData.password,
          };

    try {
      setLoading(true);
      const response = await axios.post(endpoint, payload);

      if (!isLogin) {
        setIsLogin(true);
        setFormData((current) => ({ ...initialForm, role: current.role, email: current.email }));
        setError("Registration complete. Sign in with your new account.");
        return;
      }

      const account = response.data.user;
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify({
        role: account.role,
        name: account.name,
        email: account.email,
      }));
      navigate(`/${account.role}/dashboard`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roleName = formData.role === "business" ? "Food Business" : "NGO";

  return (
    <AuthLayout
      title={isLogin ? "Welcome back" : "Create your account"}
      subtitle={isLogin ? "Sign in with your email and password" : "Choose the role that represents your organization"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && <label className="block text-sm font-medium text-slate-300">Organization role
          <select name="role" value={formData.role} onChange={handleChange} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-white outline-none focus:border-emerald-400">
            <option value="business">Food Business</option><option value="ngo">NGO</option>
          </select>
        </label>}

        {!isLogin && <InputField label={`${roleName} Name`} type="text" name="name" placeholder={`Enter ${roleName.toLowerCase()} name`} value={formData.name} onChange={handleChange} />}
        {!isLogin && formData.role === "business" && <RoleSelector value={formData.businessType} onChange={handleChange} />}
        {!isLogin && formData.role === "ngo" && <InputField label="Registration Number" type="text" name="registrationNumber" placeholder="Enter registration number" value={formData.registrationNumber} onChange={handleChange} />}
        <InputField label="Email" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
        {!isLogin && <InputField label="Phone Number" type="tel" name="phone" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} />}
        {!isLogin && <InputField label="Address" type="text" name="address" placeholder="Enter address" value={formData.address} onChange={handleChange} />}
        <PasswordInput label="Password" name="password" placeholder="Enter password" value={formData.password} onChange={handleChange} />
        {!isLogin && <><PasswordStrength password={formData.password} /><PasswordInput label="Confirm Password" name="confirmPassword" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} /></>}

        {error && <p className={`rounded-lg border px-3 py-2 text-sm ${error.startsWith("Registration complete") ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>{error}</p>}
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70">
          {loading && <LoaderCircle className="animate-spin" size={18} />}
          {isLogin ? "Sign in" : "Create account"}
        </button>
        <p className="text-center text-sm text-slate-400">
          {isLogin ? "New here?" : "Already have an account?"}
          <button type="button" onClick={switchMode} className="ml-2 font-semibold text-emerald-400 hover:text-emerald-300">{isLogin ? "Create an account" : "Sign in"}</button>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Auth;
