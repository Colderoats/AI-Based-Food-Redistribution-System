import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getInventory } from "../../services/inventoryService";

function Dashboard() {
  const navigate = useNavigate();

  const [inventoryCount, setInventoryCount] = useState(0);
  const [recentInventory, setRecentInventory] = useState([]);

  // Temporary values until APIs are ready
  const [surplusCount] = useState(18);
  const [foodSaved] = useState("1,260 kg");
  const [pendingPickups] = useState(6);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await getInventory();

        if (response.success) {
          setInventoryCount(response.inventory.length);

          setRecentInventory(
            [...response.inventory]
              .sort(
                (a, b) =>
                  new Date(b.purchase_date) -
                  new Date(a.purchase_date)
              )
              .slice(0, 5)
          );
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      }
    };

    loadDashboard();
  }, []);

  // Items expiring within 7 days
  const expiryAlerts = recentInventory.filter((item) => {
    const today = new Date();
    const expiry = new Date(item.expiry_date);

    const diff =
      (expiry - today) / (1000 * 60 * 60 * 24);

    return diff <= 7;
  });

  return (
    <DashboardLayout
      title="Business Dashboard"
      role="Food Business"
    >
      {/* ================= Dashboard Cards ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Inventory */}

        <div
          onClick={() => navigate("/business/inventory")}
          className="bg-slate-900 rounded-xl p-6 cursor-pointer hover:bg-slate-800 hover:scale-105 transition-all duration-300"
        >
          <h3 className="text-gray-400">
            Inventory Items
          </h3>

          <p className="text-4xl font-bold mt-3">
            {inventoryCount}
          </p>
        </div>

        {/* Surplus */}

        <div
          onClick={() => navigate("/business/surplus")}
          className="bg-slate-900 rounded-xl p-6 cursor-pointer hover:bg-slate-800 hover:scale-105 transition-all duration-300"
        >
          <h3 className="text-gray-400">
            Surplus Items
          </h3>

          <p className="text-4xl font-bold mt-3">
            {surplusCount}
          </p>
        </div>

        {/* Food Saved */}

        <div className="bg-slate-900 rounded-xl p-6 hover:bg-slate-800 transition">

          <h3 className="text-gray-400">
            Food Saved
          </h3>

          <p className="text-4xl font-bold mt-3">
            {foodSaved}
          </p>

        </div>

        {/* Pickups */}

        <div className="bg-slate-900 rounded-xl p-6 hover:bg-slate-800 transition">

          <h3 className="text-gray-400">
            Pending Pickups
          </h3>

          <p className="text-4xl font-bold mt-3">
            {pendingPickups}
          </p>

        </div>

      </div>

      {/* ================= Business Overview ================= */}

      <div className="mt-10 bg-slate-900 rounded-xl p-8">

        <h2 className="text-2xl font-semibold mb-4">
          Business Overview
        </h2>

        <p className="text-gray-400 leading-8">
          Welcome to your dashboard. Manage inventory,
          convert surplus food into donations, monitor
          expiry dates, and track food redistribution
          statistics in real time.
        </p>

      </div>

      {/* ================= Two Column Section ================= */}

      <div className="grid lg:grid-cols-2 gap-8 mt-10">
{/* ================= Quick Actions ================= */}

<div className="mt-10 bg-slate-900 rounded-xl p-8">

  <h2 className="text-2xl font-semibold mb-6">
    Quick Actions
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

    <button
      onClick={() => navigate("/business/inventory")}
      className="bg-emerald-600 hover:bg-emerald-700 rounded-lg p-5 text-left transition"
    >
      <h3 className="text-lg font-semibold">
        ➕ Add Inventory
      </h3>

      <p className="text-sm text-emerald-100 mt-2">
        Add a new product to your inventory.
      </p>
    </button>

    <button
      onClick={() => navigate("/business/inventory")}
      className="bg-blue-600 hover:bg-blue-700 rounded-lg p-5 text-left transition"
    >
      <h3 className="text-lg font-semibold">
        📤 Upload CSV
      </h3>

      <p className="text-sm text-blue-100 mt-2">
        Import inventory in bulk using a CSV file.
      </p>
    </button>

    <button
      onClick={() => navigate("/business/surplus")}
      className="bg-orange-500 hover:bg-orange-600 rounded-lg p-5 text-left transition"
    >
      <h3 className="text-lg font-semibold">
        🎁 Create Surplus Listing
      </h3>

      <p className="text-sm text-orange-100 mt-2">
        Donate surplus food to NGOs before it expires.
      </p>
    </button>

    <button
      onClick={() => navigate("/business/analytics")}
      className="bg-purple-600 hover:bg-purple-700 rounded-lg p-5 text-left transition"
    >
      <h3 className="text-lg font-semibold">
        📊 View Analytics
      </h3>

      <p className="text-sm text-purple-100 mt-2">
        Analyze inventory trends and donations.
      </p>
    </button>

    <button
      onClick={() => navigate("/business/donations")}
      className="bg-pink-600 hover:bg-pink-700 rounded-lg p-5 text-left transition"
    >
      <h3 className="text-lg font-semibold">
        🤝 View Donations
      </h3>

      <p className="text-sm text-pink-100 mt-2">
        Track donated food and NGO requests.
      </p>
    </button>

  </div>

</div>
        {/* Recent Inventory */}

        <div className="bg-slate-900 rounded-xl p-6">

          <h2 className="text-2xl font-semibold mb-6">
            Recent Inventory Activity
          </h2>

          {recentInventory.length === 0 ? (

            <p className="text-gray-400">
              No inventory added yet.
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-slate-700">

                    <th className="text-left py-3">
                      Product
                    </th>

                    <th className="text-left py-3">
                      Category
                    </th>

                    <th className="text-left py-3">
                      Qty
                    </th>

                    <th className="text-left py-3">
                      Expiry
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentInventory.map((item) => (

                    <tr
                      key={item.inventory_id}
                      className="border-b border-slate-800 hover:bg-slate-800"
                    >

                      <td className="py-4">
                        {item.product_name}
                      </td>

                      <td>
                        {item.category}
                      </td>

                      <td>
                        {item.quantity}
                      </td>

                      <td>
                        {new Date(
                          item.expiry_date
                        ).toLocaleDateString()}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* Expiry Alerts */}

        <div className="bg-slate-900 rounded-xl p-6">

          <h2 className="text-2xl font-semibold mb-6">
            Expiry Alerts
          </h2>

          {expiryAlerts.length === 0 ? (

            <div className="text-green-400">
              🎉 No products are expiring within
              the next 7 days.
            </div>

          ) : (

            <div className="space-y-4">

              {expiryAlerts.map((item) => (

                <div
                  key={item.inventory_id}
                  className="bg-red-500/10 border border-red-500 rounded-lg p-4"
                >

                  <h3 className="font-semibold text-red-300">
                    {item.product_name}
                  </h3>

                  <p className="text-gray-300">
                    Quantity: {item.quantity}
                  </p>

                  <p className="text-gray-400">
                    Expires on{" "}
                    {new Date(
                      item.expiry_date
                    ).toLocaleDateString()}
                  </p>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </DashboardLayout>
  );
}

export default Dashboard;