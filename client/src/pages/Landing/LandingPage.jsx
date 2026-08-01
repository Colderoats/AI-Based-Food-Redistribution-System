import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowRight, Leaf } from "lucide-react";
import hero from "../../assets/hero.png";

function LandingPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");

  const handleContinue = () => {
    if (!role) {
      alert("Please select a user type.");
      return;
    }

    switch (role) {
      case "business":
      case "ngo":
        navigate(`/auth?mode=register&role=${role}`);
        break;

      case "admin":
        navigate("/admin/login");
        break;

      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col lg:flex-row items-center justify-between">

        {/* LEFT */}
        <div className="max-w-xl">

          <div className="flex items-center gap-3 mb-6">
            <Leaf className="text-emerald-400" size={34} />
            <h1 className="text-5xl font-extrabold">
              AI Food Redistribution
            </h1>
          </div>

          <h2 className="text-2xl text-gray-300 leading-relaxed mb-8">
            Reduce food waste using Artificial Intelligence and connect
            food businesses with NGOs through smart surplus redistribution.
          </h2>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 w-full max-w-md">

            <label className="block mb-3 text-lg font-semibold">
              Select User Type
            </label>

            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full appearance-none rounded-xl bg-slate-900 border border-slate-700 px-5 py-4 text-lg outline-none focus:border-emerald-400"
              >
                <option value="">Choose User Type</option>
                <option value="business">Food Business</option>
                <option value="ngo">NGO</option>
                <option value="admin">Admin</option>
              </select>

              <ChevronDown
                className="absolute right-5 top-4 text-gray-400 pointer-events-none"
                size={24}
              />
            </div>

            <button
              onClick={handleContinue}
              className="mt-6 w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 transition-all py-4 text-lg font-semibold flex justify-center items-center gap-2"
            >
              Continue
              <ArrowRight size={20} />
            </button>

          </div>
        </div>

        {/* RIGHT */}
        <div className="mt-16 lg:mt-0">
          <img
            src={hero}
            alt="Food Redistribution"
            className="w-[550px] drop-shadow-2xl"
          />
        </div>

      </div>
    </div>
  );
}

export default LandingPage;
