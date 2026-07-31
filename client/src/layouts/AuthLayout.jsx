import { Leaf } from "lucide-react";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">

      <div className="w-full max-w-6xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl grid lg:grid-cols-2">

        {/* Left Panel */}

        <div className="bg-emerald-600 text-white flex flex-col justify-center px-12 py-16">

          <Leaf size={70} className="mb-8" />

          <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
            AI Food
            <br />
            Redistribution
          </h1>

          <div className="mt-10 space-y-4 text-xl lg:text-2xl">

            <p>Predict food waste.</p>

            <p>Connect businesses.</p>

            <p>Feed communities.</p>

          </div>

        </div>

        {/* Right Panel */}

        <div className="bg-slate-800 flex items-center justify-center px-10 py-16">

          <div className="w-full max-w-md">

            <h2 className="text-4xl font-bold text-white">
              {title}
            </h2>

            <p className="text-gray-400 mt-2 mb-8">
              {subtitle}
            </p>

            {children}

          </div>

        </div>

      </div>

    </div>
  );
}

export default AuthLayout;