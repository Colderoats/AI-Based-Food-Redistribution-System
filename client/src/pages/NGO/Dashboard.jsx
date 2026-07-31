import DashboardLayout from "../../layouts/DashboardLayout";

function Dashboard() {
  return (
    <DashboardLayout
      title="NGO Dashboard"
      role="Food Recipient Organization"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-gray-400">Available Donations</h3>
          <p className="text-3xl font-bold mt-3">37</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-gray-400">Requested Donations</h3>
          <p className="text-3xl font-bold mt-3">15</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-gray-400">Completed Pickups</h3>
          <p className="text-3xl font-bold mt-3">28</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-gray-400">Meals Served</h3>
          <p className="text-3xl font-bold mt-3">8,420</p>
        </div>

      </div>

      <div className="mt-8 bg-slate-900 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">
          NGO Overview
        </h2>

        <p className="text-gray-400">
          Donation requests, pickup schedules, received food, and community
          impact analytics will be displayed here.
        </p>
      </div>

    </DashboardLayout>
  );
}

export default Dashboard;