import { Bell, LogOut, UserCircle } from "lucide-react";

function DashboardLayout({
  title,
  role,
  sidebar,
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* Sidebar */}

      <aside className="w-72 bg-slate-900 border-r border-slate-800">

        {sidebar}

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

                <p className="font-semibold">
                  Welcome
                </p>

                <p className="text-sm text-gray-400">
                  User
                </p>

              </div>

            </div>

            <button className="flex items-center gap-2 text-red-400 hover:text-red-500 transition">

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