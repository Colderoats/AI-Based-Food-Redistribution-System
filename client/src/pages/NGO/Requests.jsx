import { useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
} from "lucide-react";

function Requests() {
  const [requests] = useState([
    {
      id: 1,
      business: "Fresh Mart",
      food: "Bread",
      quantity: "40 Packs",
      status: "Pending",
      requestedOn: "29 Jul 2026",
    },
    {
      id: 2,
      business: "ABC Restaurant",
      food: "Cooked Meals",
      quantity: "120 Meals",
      status: "Accepted",
      requestedOn: "28 Jul 2026",
    },
    {
      id: 3,
      business: "Green Basket",
      food: "Vegetables",
      quantity: "60 Kg",
      status: "Completed",
      requestedOn: "27 Jul 2026",
    },
    {
      id: 4,
      business: "City Bakery",
      food: "Cake",
      quantity: "15 Boxes",
      status: "Rejected",
      requestedOn: "26 Jul 2026",
    },
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <span className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">
            <Clock size={16} />
            Pending
          </span>
        );

      case "Accepted":
        return (
          <span className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
            <Truck size={16} />
            Accepted
          </span>
        );

      case "Completed":
        return (
          <span className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
            <CheckCircle size={16} />
            Completed
          </span>
        );

      case "Rejected":
        return (
          <span className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full">
            <XCircle size={16} />
            Rejected
          </span>
        );

      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      {/* Header */}

      <div className="mb-10">

        <h1 className="text-4xl font-bold">
          My Requests
        </h1>

        <p className="text-gray-400 mt-2">
          Track all donation requests sent to food businesses.
        </p>

      </div>

      {/* Request Table */}

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-800">

            <tr>

              <th className="text-left px-6 py-4">
                Business
              </th>

              <th>Food Item</th>

              <th>Quantity</th>

              <th>Requested On</th>

              <th>Status</th>

            </tr>

          </thead>

          <tbody>

            {requests.map((request) => (

              <tr
                key={request.id}
                className="border-t border-slate-800 hover:bg-slate-800 transition"
              >

                <td className="px-6 py-5 font-medium">
                  {request.business}
                </td>

                <td>

                  <div className="flex items-center justify-center gap-2">

                    <Package size={16} />

                    {request.food}

                  </div>

                </td>

                <td className="text-center">
                  {request.quantity}
                </td>

                <td className="text-center">
                  {request.requestedOn}
                </td>

                <td className="flex justify-center py-4">
                  {getStatusBadge(request.status)}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Requests;