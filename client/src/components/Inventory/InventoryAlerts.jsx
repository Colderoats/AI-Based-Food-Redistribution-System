function InventoryAlerts({ alerts = [], onRefresh }) {
  if (!alerts.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
        No active expiry alerts. Inventory is in a healthy state.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="rounded-xl border border-amber-500/30 bg-slate-900 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-white">{alert.title}</p>
              <p className="mt-1 text-sm text-slate-300">{alert.message}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${alert.priority === "high" ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-300"}`}>
              {alert.priority}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>{alert.category}</span>
            <span>{alert.daysLeft !== null ? `${alert.daysLeft} days left` : "Check item"}</span>
          </div>
        </div>
      ))}

      {onRefresh && (
        <button type="button" onClick={onRefresh} className="mt-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 hover:border-emerald-500 hover:text-emerald-300">
          Refresh alerts
        </button>
      )}
    </div>
  );
}

export default InventoryAlerts;
