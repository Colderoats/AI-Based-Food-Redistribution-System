import { useState } from "react";
import {
  PlusCircle,
  Package,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
} from "lucide-react";

function Surplus() {
  const [surplusFood] = useState([
    {
      id: 1,
      food: "Bread",
      quantity: "40 Packs",
      expiry: "Today",
      location: "Chennai",
      status: "Available",
    },
    {
      id: 2,
      food: "Cooked Rice",
      quantity: "25 Kg",
      expiry: "Today",
      location: "Tambaram",
      status: "Claimed",
    },
    {
      id: 3,
      food: "Milk",
      quantity: "60 Bottles",
      expiry: "Tomorrow",
      location: "Velachery",
      status: "Delivered",
    },
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            Surplus Food Management
          </h1>

          <p className="text-gray-400 mt-2">
            Donate surplus food before it expires and help nearby NGOs.
          </p>

        </div>

        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-5 py-3 rounded-xl transition">

          <PlusCircle size={20} />

          Publish Surplus

        </button>

      </div>

      {/* Summary Cards */}

      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <Package className="text-emerald-400 mb-4" size={32} />

          <h3 className="text-gray-400">
            Total Listings
          </h3>

          <p className="text-4xl font-bold mt-3">
            18
          </p>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <Clock className="text-yellow-400 mb-4" size={32} />

          <h3 className="text-gray-400">
            Pending Pickup
          </h3>

          <p className="text-4xl font-bold mt-3">
            5
          </p>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <CheckCircle className="text-blue-400 mb-4" size={32} />

          <h3 className="text-gray-400">
            Completed Donations
          </h3>

          <p className="text-4xl font-bold mt-3">
            13
          </p>

        </div>

      </div>

      {/* Surplus Table */}

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-800">

            <tr>

              <th className="text-left px-6 py-4">
                Food Item
              </th>

              <th>Quantity</th>

              <th>Expiry</th>

              <th>Location</th>

              <th>Status</th>

            </tr>

          </thead>

          <tbody>

            {surplusFood.map((item) => (

              <tr
                key={item.id}
                className="border-t border-slate-800 hover:bg-slate-800 transition"
              >

                <td className="px-6 py-5 font-medium flex items-center gap-2">

                  <Package size={18} className="text-emerald-400" />

                  {item.food}

                </td>

                <td className="text-center">
                  {item.quantity}
                </td>

                <td className="text-center">

                  <div className="flex justify-center items-center gap-2">

                    <Calendar size={16} />

                    {item.expiry}

                  </div>

                </td>

                <td className="text-center">

                  <div className="flex justify-center items-center gap-2">

                    <MapPin size={16} />

                    {item.location}

                  </div>

                </td>

                <td className="text-center">

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      item.status === "Available"
                        ? "bg-green-500/20 text-green-400"
                        : item.status === "Claimed"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {item.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Surplus;