import csv from "csv-parser";
import { Readable } from "stream";
import pool from "../config/db.js";
import { FOOD_CATEGORIES, normalizeCategory } from "../utils/inventoryEngine.js";
import { insertItem } from "./inventoryController.js";
import { scoreAndPersistInventory } from "../services/aiPredictionService.js";

const value = (row, ...names) => names.map((name) => row[name] ?? row[name.toLowerCase()] ?? row[name.toUpperCase()]).find((item) => item !== undefined);

export const uploadInventoryCSV = async (req, res) => {
  if (!req.file) return res.status(400).json({ success:false, message:"Choose a CSV file to upload." });
  const rows=[];
  try {
    await new Promise((resolve,reject)=>Readable.from(req.file.buffer).pipe(csv({ mapHeaders:({header})=>header.trim().toLowerCase().replace(/[\s-]+/g,"_") })).on("data",(row)=>rows.push(row)).on("end",resolve).on("error",reject));
    if (!rows.length) return res.status(400).json({success:false,message:"The CSV contains no data rows."});
    const client=await pool.connect();
    try { await client.query("BEGIN"); const rejected=[]; const importedItems=[]; let imported=0;
      for(let index=0;index<rows.length;index+=1){ const row=rows[index]; const category=value(row,"category"); const normalized=normalizeCategory(category); const productCode=value(row,"product_id","product_code","sku"); const productName=value(row,"product_name","product"); if(!productCode || !productName){rejected.push({row:index+2,product_id:productCode,product_name:productName,field:!productCode?"product_id":"product_name",message:"Product ID and Product Name are required."});continue;} if(!normalized){rejected.push({row:index+2,product_id:productCode,product_name:productName,field:"category",message:`Category is required and must be one of: ${FOOD_CATEGORIES.join(", ")}.`});continue;}
        try { const item=await insertItem(client,req.user.id,{product_code:productCode,product_name:productName,category:normalized,quantity:value(row,"quantity"),unit:value(row,"unit")||"units",purchase_date:value(row,"purchase_date"),expiry_date:value(row,"expiry_date"),unit_price:value(row,"unit_price","price"),supplier:value(row,"supplier"),batch_number:value(row,"batch_number","batch"),storage_type:value(row,"storage_type","storage"),purchase_cost:value(row,"purchase_cost"),selling_price:value(row,"selling_price"),barcode:value(row,"barcode","qr_value"),notes:value(row,"notes")}); importedItems.push(item); imported+=1; } catch(error) { rejected.push({row:index+2,product_id:productCode,product_name:productName,message:error.validation ? Object.values(error.validation).join(" ") : "Could not import this row."}); }
      }
      await client.query("COMMIT");
      let scored=0; for (const item of importedItems) { try { await scoreAndPersistInventory(item,req.user.id,client); scored+=1; } catch(error) { console.error("Unable to score imported inventory:",error.message); } }
      res.status(rejected.length ? 207 : 201).json({success:true,message:`Imported ${imported} item(s).${rejected.length ? ` ${rejected.length} row(s) need correction.` : ""}`,importedRows:imported,scored,rejected,categories:FOOD_CATEGORIES});
    } catch(error){await client.query("ROLLBACK");throw error;} finally{client.release();}
  } catch(error){console.error(error);res.status(500).json({success:false,message:"Unable to process the CSV file."});}
};
