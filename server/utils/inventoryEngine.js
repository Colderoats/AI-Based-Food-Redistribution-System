export const FOOD_CATEGORIES = [
  "Fruits", "Vegetables", "Dairy", "Meat", "Poultry", "Seafood", "Bakery",
  "Beverages", "Frozen Foods", "Dry Goods", "Ready-to-Eat", "Snacks",
  "Condiments", "Grains", "Spices", "Other",
];

const aliases = {
  fruit: "Fruits", fruits: "Fruits", vegetable: "Vegetables", vegetables: "Vegetables",
  frozen: "Frozen Foods", "dry goods": "Dry Goods", dry: "Dry Goods",
  ready_to_eat: "Ready-to-Eat", "ready to eat": "Ready-to-Eat", grain: "Grains",
};

export const normalizeCategory = (category) => {
  const value = String(category || "").trim();
  if (!value) return null;
  return FOOD_CATEGORIES.find((item) => item.toLowerCase() === value.toLowerCase())
    || aliases[value.toLowerCase()] || null;
};

export const getExpiryStatus = (expiryDate, thresholdDays = 7) => {
  if (!expiryDate) return { level: "safe", label: "Safe", daysRemaining: null };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate); expiry.setHours(0, 0, 0, 0);
  const daysRemaining = Math.round((expiry - today) / 86400000);
  if (daysRemaining < 0) return { level: "expired", label: "Expired", daysRemaining };
  if (daysRemaining === 0) return { level: "today", label: "Expiring Today", daysRemaining };
  if (daysRemaining <= thresholdDays) return { level: "near_expiry", label: "Near Expiry", daysRemaining };
  return { level: "safe", label: "Safe", daysRemaining };
};

export const withExpiryStatus = (item) => ({ ...item, expiry: getExpiryStatus(item.expiry_date, Number(item.alert_days || 7)) });
