import axios from "axios";

const API_URL = "http://localhost:5000/api/inventory";

// Get JWT token from localStorage
const getToken = () => {
  return localStorage.getItem("token");
};

// Common headers
const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// =========================
// Get all inventory
// =========================
export const getInventory = async (params = {}) => {
  const response = await axios.get(API_URL, {
    headers: getHeaders(),
    params,
  });

  return response.data;
};

// =========================
// Get inventory by ID
// =========================
export const getInventoryById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: getHeaders(),
  });

  return response.data;
};

// =========================
// Add inventory
// =========================
export const addInventory = async (inventoryData) => {
  const response = await axios.post(API_URL, inventoryData, {
    headers: getHeaders(),
  });

  return response.data;
};

// =========================
// Update inventory
// =========================
export const updateInventory = async (id, inventoryData) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    inventoryData,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

// =========================
// Delete inventory
// =========================
export const deleteInventory = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getHeaders(),
  });

  return response.data;
};

// =========================
// Upload CSV
// =========================
export const uploadCSV = async (formData) => {
  const response = await axios.post(
    `${API_URL}/upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  return response.data;
};
export const getExpiryAlerts = async () => (await axios.get(`${API_URL}/alerts`, { headers: getHeaders() })).data;
export const removeExpiredInventory = async () => (await axios.delete(`${API_URL}/expired`, { headers: getHeaders() })).data;
export const removeInventoryItems = async (inventory_ids) => (await axios.delete(`${API_URL}/bulk`, { headers: getHeaders(), data: { inventory_ids } })).data;
export const lookupBarcode = async (barcode) => (await axios.get(`${API_URL}/barcode/${encodeURIComponent(barcode)}`, { headers: getHeaders() })).data;
export const getNotifications = async () => (await axios.get("http://localhost:5000/api/notifications/inventory", { headers: getHeaders() })).data;
