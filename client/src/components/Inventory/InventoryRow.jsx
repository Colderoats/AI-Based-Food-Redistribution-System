import { Pencil, Trash2 } from "lucide-react";

function InventoryRow({ item, onEdit, onDelete }) {
  return (
    <tr className="border-b hover:bg-gray-100">

      <td className="px-4 py-3 text-black">
        {item.product_name}
      </td>

      <td className="px-4 py-3 text-black">
        {item.category}
      </td>

      <td className="px-4 py-3 text-center text-black">
        ₹{item.unit_price}
      </td>

      <td className="px-4 py-3 text-center text-black">
        {item.quantity}
      </td>

      <td className="px-4 py-3 text-center text-black">
        {new Date(item.purchase_date).toLocaleDateString()}
      </td>

      <td className="px-4 py-3 text-center text-black">
        {new Date(item.expiry_date).toLocaleDateString()}
      </td>

      <td className="px-4 py-3">
        <div className="flex justify-center gap-3">

          <button
            onClick={() => onEdit?.(item)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={() => onDelete?.(item.inventory_id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </button>

        </div>
      </td>

    </tr>
  );
}

export default InventoryRow;