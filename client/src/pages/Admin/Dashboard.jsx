import DashboardLayout from "../../layouts/DashboardLayout";

function Dashboard() {
  return (
    <DashboardLayout
      title="Admin Dashboard"
      role="System Administrator"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-gray-400">Registered Businesses</h3>
          <p className="text-3xl font-bold mt-3">245</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-gray-400">Registered NGOs</h3>
          <p className="text-3xl font-bold mt-3">96</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-gray-400">Donations Today</h3>
          <p className="text-3xl font-bold mt-3">42</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-gray-400">Pending Approvals</h3>
          <p className="text-3xl font-bold mt-3">11</p>
        </div>

      </div>

      <div className="mt-8 bg-slate-900 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">
          System Overview
        </h2>

        <p className="text-gray-400">
          Analytics, reports, user management, donation monitoring, and
          platform statistics will be displayed here.
        </p>
      </div>

    </DashboardLayout>
  );
}

export default Dashboard;