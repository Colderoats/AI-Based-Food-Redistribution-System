import { Bell, Building2, HandHeart, LayoutDashboard, Leaf, ListChecks, LogOut, Package, UserCircle, UsersRound, UserPen } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function DashboardLayout({
  title,
  role,
  children,
}) {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const user = storedUser || { role: role === "Food Business" ? "business" : "ngo", name: "User" };
  const isBusiness = user.role === "business";
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

            <button className="relative hover:text-emerald-400 transition">

              <Bell size={22} />

              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500"></span>

            </button>

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
