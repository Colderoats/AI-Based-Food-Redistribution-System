import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* Navigation */}

      <header className="bg-slate-900 border-b border-slate-800">

        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">

          {/* Logo */}

          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <Leaf className="text-emerald-400" size={34} />

            <div>

              <h1 className="text-xl font-bold">
                AI Food Redistribution
              </h1>

              <p className="text-sm text-gray-400">
                Reduce Waste. Feed Communities.
              </p>

            </div>

          </Link>

          {/* Navigation Links */}

          <nav className="hidden md:flex items-center gap-8 text-gray-300">

            <Link
              to="/"
              className="hover:text-emerald-400 transition"
            >
              Home
            </Link>

            <Link
              to="/business/login"
              className="hover:text-emerald-400 transition"
            >
              Business
            </Link>

            <Link
              to="/ngo/login"
              className="hover:text-emerald-400 transition"
            >
              NGO
            </Link>

            <Link
              to="/admin/login"
              className="hover:text-emerald-400 transition"
            >
              Admin
            </Link>

          </nav>

        </div>

      </header>

      {/* Main Content */}

      <main className="flex-1">

        {children}

      </main>

      {/* Footer */}

      <footer className="bg-slate-900 border-t border-slate-800 py-6">

        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-3">

          <p className="text-gray-400 text-sm">
            © 2026 AI-Based Food Redistribution System. All Rights Reserved.
          </p>

          <p className="text-gray-500 text-sm">
            Built using React • Node.js • PostgreSQL • AI
          </p>

        </div>

      </footer>

    </div>
  );
}

export default MainLayout;