import InventoryRow from "./InventoryRow";

function InventoryTable({
  inventory = [],
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md">
      <table className="min-w-full">
        <thead className="bg-emerald-600 text-white">
          <tr>
            <th className="px-4 py-3 text-left">
              Product
            </th>

            <th className="px-4 py-3 text-left">
              Category
            </th>

            <th className="px-4 py-3 text-center">
              Unit Price
            </th>

            <th className="px-4 py-3 text-center">
              Quantity
            </th>

            <th className="px-4 py-3 text-center">
              Purchase Date
            </th>

            <th className="px-4 py-3 text-center">
              Expiry Date
            </th>

            <th className="px-4 py-3 text-center">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {inventory.length === 0 ? (
            <tr>
              <td
                colSpan="7"
                className="py-8 text-center text-gray-500"
              >
                No inventory items found.
              </td>
            </tr>
          ) : (
            inventory.map((item) => (
              <InventoryRow
                key={item.inventory_id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryTable;