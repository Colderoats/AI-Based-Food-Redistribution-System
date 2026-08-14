import { useCallback, useEffect, useMemo, useState } from "react";
import { BellRing, BrainCircuit, Package, RefreshCw } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getExpiryAlerts, getInventory } from "../../services/inventoryService";
import { subscribeToAiUpdates } from "../../services/aiUpdates";

function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async () => {
    try {
      const [items, expiry] = await Promise.all([getInventory(), getExpiryAlerts()]);
      setInventory(items.inventory || []);
      setAlerts(expiry.alerts || []);
      setUpdatedAt(new Date());
    } catch {
      setInventory([]);
      setAlerts([]);
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(load, 0);
    const unsubscribe = subscribeToAiUpdates(load);
    const interval = setInterval(load, 60000);
    return () => { clearTimeout(initial); unsubscribe(); clearInterval(interval); };
  }, [load]);

  const stats = useMemo(() => ({
    near: inventory.filter((item) => ["near_expiry", "today"].includes(item.expiry?.level)).length,
    expired: inventory.filter((item) => item.expiry?.level === "expired").length,
    high: alerts.filter((item) => item.risk_tier === "high").length,
  }), [inventory, alerts]);
  const cards = [["Total products", inventory.length, Package, "text-emerald-300"], ["Near expiry", stats.near, BellRing, "text-amber-300"], ["Expired", stats.expired, Package, "text-red-300"], ["High AI risks", stats.high, BrainCircuit, "text-red-300"]];

  return <DashboardLayout title="Dashboard" role="Food Business"><div className="space-y-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold">Business dashboard</h1><p className="mt-1 text-slate-400">Your inventory health and AI-led operational priorities at a glance.</p></div><button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"><RefreshCw size={15} />Refresh</button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon, color]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-5"><Icon className={color} size={21} /><p className="mt-5 text-sm text-slate-400">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div>)}</div><div className="grid gap-6 xl:grid-cols-2"><section className="rounded-xl border border-slate-800 bg-slate-900 p-5"><h2 className="font-semibold">AI risk and reorder recommendations</h2><p className="mt-1 text-sm text-slate-400">Scores refresh when a new scoring event arrives.</p>{alerts.length ? <div className="mt-4 space-y-3">{alerts.slice(0, 5).map((item) => <div key={item.inventory_id} className="border-b border-slate-800 pb-3 text-sm"><div className="flex justify-between gap-3"><p className="font-medium">{item.product_name}</p><span className={item.risk_tier === "high" ? "text-red-300" : "text-amber-300"}>{item.risk_tier} · {Math.round(Number(item.risk_score))}%</span></div><p className="mt-1 text-slate-400">{item.recommended_action}</p>{item.reorder_recommendation?.recommended_purchase_quantity != null && <p className="mt-1 text-emerald-300">Recommended reorder: {item.reorder_recommendation.recommended_purchase_quantity}</p>}</div>)}</div> : <p className="mt-4 text-sm text-slate-400">No elevated AI risk scores are available.</p>}</section><section className="rounded-xl border border-slate-800 bg-slate-900 p-5"><h2 className="font-semibold">Recent inventory additions</h2>{inventory.length ? <div className="mt-4 space-y-3">{inventory.slice(0, 5).map((item) => <div key={item.inventory_id} className="flex justify-between border-b border-slate-800 pb-3 text-sm"><span>{item.product_name}</span><span className="text-slate-400">{item.quantity} {item.unit}</span></div>)}</div> : <p className="mt-4 text-sm text-slate-400">Recent additions will appear after you add inventory.</p>}</section></div>{updatedAt && <p className="text-xs text-slate-500">Last refreshed {updatedAt.toLocaleTimeString()}</p>}</div></DashboardLayout>;
}

export default Dashboard;
