import { Bell, Building2, HandHeart, LayoutDashboard, Leaf, ListChecks, LogOut, Package, UserCircle, UsersRound, UserPen } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { deleteInventory, getNotifications, removeExpiredInventory } from "../services/inventoryService";

function DashboardLayout({
  title,
  role,
  children,
}) {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const user = storedUser || { role: role === "Food Business" ? "business" : "ngo", name: "User" };
  const isBusiness = user.role === "business";
  const refreshAlerts = useCallback(async () => {
    if (!isBusiness || !localStorage.getItem("token")) return;
    try {
      const response = await getNotifications();
      const nextAlerts = response.alerts || [];
      setAlerts(nextAlerts);
      const expired = nextAlerts.filter((item) => item.expiry?.level === "expired");
      const alertKey = `expired-alert-${expired.map((item) => item.inventory_id).join("-")}`;
      if (expired.length && sessionStorage.getItem("seen-expired-alert") !== alertKey) {
        sessionStorage.setItem("seen-expired-alert", alertKey);
        setShowNotifications(true);
      }
    } catch { setAlerts([]); }
  }, [isBusiness]);
  useEffect(() => { const initial = setTimeout(refreshAlerts, 0); const interval = setInterval(refreshAlerts, 60000); return () => { clearTimeout(initial); clearInterval(interval); }; }, [refreshAlerts]);
  const removeOne = async (id) => { if (!window.confirm("Remove this expired inventory item?")) return; try { await deleteInventory(id); refreshAlerts(); } catch { window.alert("This item could not be removed."); } };
  const removeAllExpired = async () => { if (!window.confirm("Remove all expired inventory items?")) return; try { await removeExpiredInventory(); refreshAlerts(); } catch { window.alert("Expired items could not be removed."); } };
  const navigation = isBusiness
    ? [
        { label: "Dashboard", path: "/business/dashboard", icon: LayoutDashboard },
        { label: "Business overview", path: "/business/overview", icon: Building2 },
        { label: "Inventory", path: "/business/inventory", icon: Package },
        { label: "Surplus listings", path: "/business/surplus", icon: ListChecks },
        { label: "NGO requests", path: "/business/requests", icon: HandHeart },
        { label: "NGO partners", path: "/business/partners", icon: UsersRound },
        { label: "Edit profile", path: "/business/profile", icon: UserPen },
      ]
    : [
        { label: "Dashboard", path: "/ngo/dashboard", icon: LayoutDashboard },
        { label: "NGO overview", path: "/ngo/overview", icon: Building2 },
        { label: "Donation requests", path: "/ngo/requests", icon: HandHeart },
        { label: "Available food", path: "/ngo/available-food", icon: Package },
        { label: "Food businesses", path: "/ngo/partners", icon: UsersRound },
        { label: "Edit profile", path: "/ngo/profile", icon: UserPen },
      ];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* Sidebar */}

      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 md:flex">
        <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400"><Leaf size={23} /></div>
          <div><p className="font-bold">FoodLoop</p><p className="text-xs text-slate-400">Redistribution hub</p></div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace</p>
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${isActive ? "bg-emerald-500/15 text-emerald-300" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
              <Icon size={19} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-4 text-sm text-slate-400"><div className="flex items-center gap-2"><Building2 size={16} />{isBusiness ? "Business workspace" : "NGO workspace"}</div></div>
      </aside>

      {/* Main Section */}

      <div className="flex-1 flex flex-col">

        {/* Header */}

        <header className="h-20 bg-slate-900 border-b border-slate-800 px-8 flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold">
              {title}
            </h1>

            <p className="text-gray-400 mt-1">
              {role}
            </p>

          </div>

          <div className="flex items-center gap-6">

            {isBusiness && <div className="relative"><button onClick={() => { setShowNotifications((value) => !value); refreshAlerts(); }} className="relative hover:text-emerald-400 transition" aria-label="Open notifications">

              <Bell size={22} />

              {alerts.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">{alerts.length}</span>}

            </button>{showNotifications && <div className="absolute right-0 top-9 z-50 w-[min(92vw,420px)] rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-semibold">Notifications</h2><button onClick={()=>setShowNotifications(false)} className="text-slate-400">×</button></div>{alerts.length ? <><div className="mt-3 max-h-80 space-y-2 overflow-y-auto">{alerts.map((item)=><div key={item.id || item.inventory_id} className={`rounded-lg border p-3 ${item.expiry?.level === "expired" ? "border-red-500/50 bg-red-500/10" : "border-amber-500/30 bg-slate-950"}`}><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.product_name || item.title}</p><p className="text-xs text-slate-400">{item.expiry ? `${item.category} · ${item.expiry.label} · ${item.expiry.daysRemaining} day(s)` : item.message}</p></div>{item.expiry?.level === "expired" && <button onClick={()=>removeOne(item.inventory_id)} className="rounded border border-red-400/50 px-2 py-1 text-xs text-red-200">Remove</button>}</div></div>)}</div><div className="mt-4 flex gap-2"><button onClick={()=>{setShowNotifications(false);navigate("/business/inventory");}} className="rounded-lg border border-slate-600 px-3 py-2 text-sm">Review all</button>{alerts.some((item)=>item.expiry?.level === "expired") && <button onClick={removeAllExpired} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium">Remove all expired</button>}</div></> : <p className="mt-3 text-sm text-slate-400">No active expiry alerts.</p>}</div>}</div>}

            <div className="flex items-center gap-3">

              <UserCircle
                size={36}
                className="text-emerald-400"
              />

              <div>

                <p className="font-semibold">Welcome, {user.name}</p>
                <p className="text-sm text-gray-400">{isBusiness ? "Food Business" : "NGO"}</p>

              </div>

            </div>

            <button onClick={logout} className="flex items-center gap-2 text-red-400 hover:text-red-500 transition">

              <LogOut size={20} />

              Logout

            </button>

          </div>

        </header>

        {/* Page Content */}

        <main className="flex-1 p-8 overflow-y-auto">

          {children}

        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;
