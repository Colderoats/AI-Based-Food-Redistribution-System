import pool from "../config/db.js";
// ===============================
// Add Inventory Item
// ===============================

export const addInventory = async (req, res) => {
  try {
    console.log(req.body);
    const {
      product_name,
      category,
      unit_price,
      quantity,
      purchase_date,
      expiry_date,
    } = req.body;

    const business_id = req.user.id;

    if (
      !product_name ||
      !category ||
      !unit_price ||
      !quantity ||
      !purchase_date ||
      !expiry_date
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Step 1: Check if product already exists for this business
    let productResult = await pool.query(
      `SELECT product_id
       FROM PRODUCT
       WHERE business_id = $1
       AND product_name = $2`,
      [business_id, product_name]
    );

    let product_id;

    if (productResult.rows.length > 0) {
      // Product exists
      product_id = productResult.rows[0].product_id;
    } else {
      // Create new product
      const newProduct = await pool.query(
        `INSERT INTO PRODUCT
        (business_id, product_name, category, unit_price)
        VALUES ($1, $2, $3, $4)
        RETURNING product_id`,
        [business_id, product_name, category, unit_price]
      );

      product_id = newProduct.rows[0].product_id;
    }

    // Step 2: Insert inventory
    const inventoryResult = await pool.query(
      `INSERT INTO INVENTORY
      (product_id, quantity, purchase_date, expiry_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        product_id,
        quantity,
        purchase_date,
        expiry_date,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Inventory added successfully.",
      inventory: inventoryResult.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Get All Inventory Items
// ===============================


export const getInventory = async (req, res) => {
  try {
    const business_id = req.user.id;

    const result = await pool.query(
      `SELECT
          i.inventory_id,
          p.product_id,
          p.product_name,
          p.category,
          p.unit_price,
          i.quantity,
          i.purchase_date,
          i.expiry_date
       FROM INVENTORY i
       JOIN PRODUCT p
         ON i.product_id = p.product_id
       WHERE p.business_id = $1
       ORDER BY i.expiry_date ASC`,
      [business_id]
    );

    res.status(200).json({
      success: true,
      total: result.rows.length,
      inventory: result.rows,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ===============================
// Get Inventory By ID
// ===============================

export const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const business_id = req.user.id;

    const result = await pool.query(
      `SELECT
          i.inventory_id,
          p.product_id,
          p.product_name,
          p.category,
          p.unit_price,
          i.quantity,
          i.purchase_date,
          i.expiry_date
       FROM INVENTORY i
       JOIN PRODUCT p
         ON i.product_id = p.product_id
       WHERE i.inventory_id = $1
         AND p.business_id = $2`,
      [id, business_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    res.status(200).json({
      success: true,
      inventory: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ===============================
// Update Inventory Item
// ===============================

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const business_id = req.user.id;

    const {
      product_name,
      category,
      unit_price,
      quantity,
      purchase_date,
      expiry_date,
    } = req.body;

    // Check inventory belongs to logged-in business
    const inventoryResult = await pool.query(
      `SELECT p.product_id
       FROM INVENTORY i
       JOIN PRODUCT p
         ON i.product_id = p.product_id
       WHERE i.inventory_id = $1
         AND p.business_id = $2`,
      [id, business_id]
    );

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    const product_id = inventoryResult.rows[0].product_id;

    // Update PRODUCT table
    await pool.query(
      `UPDATE PRODUCT
       SET
         product_name = $1,
         category = $2,
         unit_price = $3
       WHERE product_id = $4`,
      [
        product_name,
        category,
        unit_price,
        product_id,
      ]
    );

    // Update INVENTORY table
    const updatedInventory = await pool.query(
      `UPDATE INVENTORY
       SET
         quantity = $1,
         purchase_date = $2,
         expiry_date = $3
       WHERE inventory_id = $4
       RETURNING *`,
      [
        quantity,
        purchase_date,
        expiry_date,
        id,
      ]
    );

    res.status(200).json({
      success: true,
      message: "Inventory updated successfully.",
      inventory: updatedInventory.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ===============================
// Delete Inventory Item
// ===============================

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const business_id = req.user.id;

    // Verify inventory belongs to logged-in business
    const inventoryResult = await pool.query(
      `SELECT i.inventory_id
       FROM INVENTORY i
       JOIN PRODUCT p
         ON i.product_id = p.product_id
       WHERE i.inventory_id = $1
         AND p.business_id = $2`,
      [id, business_id]
    );

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    await pool.query(
      `DELETE FROM INVENTORY
       WHERE inventory_id = $1`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

