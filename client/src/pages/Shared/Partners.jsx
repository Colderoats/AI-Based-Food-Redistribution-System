import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

function Partners() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [matches, setMatches] = useState([]); const [foodType, setFoodType] = useState(""); const [maxDistance, setMaxDistance] = useState(20); const [ready, setReady] = useState(true); const [message, setMessage] = useState("");
  const load = async () => { try { const { data } = await api.get("/matches", { params: { foodType, maxDistance } }); setMatches(data.matches); setReady(data.matchingReady); } catch (error) { setMessage(error.response?.data?.message || "Unable to load partner matches."); } };
  useEffect(() => {
    // Load initial matches; subsequent searches use the explicit filter action.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // load deliberately reads the initial filter values only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const isNgo = user.role === "ngo";
  return <DashboardLayout title={isNgo ? "Food businesses" : "NGO partners"} role={isNgo ? "Food Recipient Organization" : "Food Business"}><div className="flex flex-col gap-4 border-b border-slate-800 pb-6 md:flex-row"><input value={foodType} onChange={(e) => setFoodType(e.target.value)} placeholder="Food type or category" className="rounded border border-slate-700 bg-slate-900 px-3 py-2" /><select value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-3 py-2"><option value="5">Within 5 km</option><option value="10">Within 10 km</option><option value="20">Within 20 km</option><option value="50">Within 50 km</option></select><button onClick={load} className="rounded bg-emerald-500 px-4 py-2 font-semibold hover:bg-emerald-600">Find partners</button></div>{!ready && <p className="mt-4 rounded border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">Add latitude and longitude in Profile to enable distance-ranked matches. Food availability is still shown.</p>}{message && <p className="mt-4 text-red-300">{message}</p>}<div className="mt-6 grid gap-4 lg:grid-cols-2">{matches.map((partner) => <article key={partner.id} className="rounded-lg border border-slate-800 bg-slate-900 p-5"><div className="flex justify-between gap-4"><h2 className="font-semibold">{partner.name}</h2>{partner.distance_km !== null && <span className="text-sm text-emerald-300">{partner.distance_km} km away</span>}</div><p className="mt-2 text-sm text-slate-400">{partner.address}</p><p className="mt-4 text-sm">{isNgo ? `${partner.available_listings || 0} available listings` : "Partner available for coordination"}</p>{partner.food_types?.length > 0 && <p className="mt-2 text-sm text-slate-400">Food: {partner.food_types.join(", ")}</p>}</article>)}</div>{!matches.length && !message && <p className="mt-8 text-slate-400">No matching partners found for these filters.</p>}</DashboardLayout>;
}
export default Partners;
