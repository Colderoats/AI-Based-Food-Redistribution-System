import csv from "csv-parser";
import { Readable } from "stream";
import pool from "../config/db.js";

// ===============================
// Upload Inventory CSV
// ===============================
export const uploadInventoryCSV = async (req, res) => {
  const client = await pool.connect();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No CSV file uploaded",
      });
    }

    const rows = [];

    const stream = Readable.from(req.file.buffer);

    stream
      .pipe(csv())
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", async () => {
        try {
          await client.query("BEGIN");

          const businessId = req.user.id;

          let imported = 0;
          let createdProducts = 0;
          let reusedProducts = 0;

          for (const row of rows) {
            const {
              product_name,
              category,
              unit_price,
              quantity,
              purchase_date,
              expiry_date,
            } = row;

            // Check if product already exists
            const existingProduct = await client.query(
              `SELECT product_id
               FROM PRODUCT
               WHERE business_id = $1
               AND product_name = $2`,
              [businessId, product_name]
            );

            let productId;

            if (existingProduct.rows.length > 0) {
              productId = existingProduct.rows[0].product_id;
              reusedProducts++;
            } else {
              const productResult = await client.query(
                `INSERT INTO PRODUCT
                (business_id, product_name, category, unit_price)
                VALUES ($1,$2,$3,$4)
                RETURNING product_id`,
                [
                  businessId,
                  product_name,
                  category,
                  unit_price,
                ]
              );

              productId = productResult.rows[0].product_id;
              createdProducts++;
            }

            await client.query(
              `INSERT INTO INVENTORY
              (product_id, quantity, purchase_date, expiry_date)
              VALUES ($1,$2,$3,$4)`,
              [
                productId,
                quantity,
                purchase_date,
                expiry_date,
              ]
            );

            imported++;
          }

          await client.query("COMMIT");

          return res.status(200).json({
            success: true,
            message: "CSV imported successfully.",
            importedRows: imported,
            createdProducts,
            reusedProducts,
          });

        } catch (err) {
          await client.query("ROLLBACK");

          console.error(err);

          return res.status(500).json({
            success: false,
            message: "Failed to import CSV.",
          });
        } finally {
          client.release();
        }
      })
      .on("error", async (err) => {
        console.error(err);

        client.release();

        return res.status(500).json({
          success: false,
          message: "Error reading CSV.",
        });
      });

  } catch (error) {
    client.release();

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};