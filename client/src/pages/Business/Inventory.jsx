import { useEffect, useState } from "react";
import {
  getInventory,
  addInventory,
  uploadCSV,
} from "../../services/inventoryService";

import InventoryTable from "../../components/Inventory/InventoryTable";
import InventoryForm from "../../components/Inventory/InventoryForm";
import InventorySearch from "../../components/Inventory/InventorySearch";
import CSVUpload from "../../components/Inventory/CSVUpload";

const emptyForm = {
  product_name: "",
  category: "",
  unit_price: "",
  quantity: "",
  purchase_date: "",
  expiry_date: "",
};

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    loadInventory();
  }, []);

  // ===============================
  // Load Inventory
  // ===============================
  const loadInventory = async () => {
    try {
      setLoading(true);

      const response = await getInventory();

      console.log("Inventory Response:", response);

      if (response.success) {
        setInventory(Array.isArray(response.inventory) ? response.inventory : []);
      } else {
        setInventory([]);
      }
    } catch (error) {
      console.error("Load Inventory Error:", error);
      alert("Failed to load inventory.");
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshInventory = async () => {
    await loadInventory();
  };

  // ===============================
  // Form Controls
  // ===============================
  const openAddForm = () => {
    setFormData(emptyForm);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData(emptyForm);
  };

  // ===============================
  // Add Inventory
  // ===============================
  const handleAddInventory = async () => {
    try {
      const response = await addInventory(formData);

      if (response.success) {
        alert("Inventory added successfully.");
        closeForm();
        await refreshInventory();
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add inventory.");
    }
  };

  // ===============================
  // Upload CSV
  // ===============================
  const handleCSVUpload = async (file) => {
    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await uploadCSV(formData);

      console.log("CSV Upload Response:", response);

      if (response.success) {
        alert(response.message);

        await refreshInventory();
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("CSV Upload Error:", error);
      alert("CSV upload failed.");
    }
  };

  // ===============================
  // Filter Inventory
  // ===============================
  const filteredInventory = Array.isArray(inventory)
    ? inventory.filter((item) => {
        const search = searchTerm.toLowerCase();

        const productName = String(item?.product_name ?? "").toLowerCase();
        const category = String(item?.category ?? "").toLowerCase();

        return (
          productName.includes(search) ||
          category.includes(search)
        );
      })
    : [];

  console.log("Inventory State:");
  console.table(filteredInventory);

  // ===============================
  // UI
  // ===============================
  return (
    <div className="p-8">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">
          Inventory Management
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <InventorySearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          <CSVUpload
            onUpload={handleCSVUpload}
          />

          <button
            onClick={openAddForm}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg"
          >
            + Add Inventory
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-lg text-gray-600">
          Loading inventory...
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="text-center text-lg text-gray-500">
          No inventory items found.
        </div>
      ) : (
        <InventoryTable
          inventory={filteredInventory}
        />
      )}

      <InventoryForm
        isOpen={isFormOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddInventory}
        onClose={closeForm}
      />
    </div>
  );
}

export default Inventory;