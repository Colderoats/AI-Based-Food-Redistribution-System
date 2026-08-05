function QuickStats({ inventory = [], alerts = [] }) {
  const totalUnits = inventory.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const highRisk = inventory.filter((item) => {
    const expiry = new Date(item.expiry_date);
    const diffDays = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">Units tracked</p>
        <p className="mt-2 text-3xl font-bold text-white">{totalUnits}</p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">Expiry alerts</p>
        <p className="mt-2 text-3xl font-bold text-amber-300">{alerts.length}</p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">High-risk items</p>
        <p className="mt-2 text-3xl font-bold text-red-300">{highRisk}</p>
      </div>
    </div>
  );
}

export default QuickStats;
