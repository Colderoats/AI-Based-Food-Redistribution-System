import pool from "../config/db.js";
import { FOOD_CATEGORIES, getExpiryStatus, normalizeCategory, withExpiryStatus } from "../utils/inventoryEngine.js";
import { scoreAndPersistInventory } from "../services/aiPredictionService.js";
import { emitAiPredictionUpdated } from "../services/aiUpdateEmitter.js";

const fields = ["product_code", "product_name", "category", "unit_price", "quantity", "unit", "purchase_date", "expiry_date", "supplier", "batch_number", "storage_type", "purchase_cost", "selling_price", "barcode", "notes", "alert_days"];
const clean = (body) => Object.fromEntries(fields.map((key) => [key, body[key] === "" ? null : body[key]]));

const validate = (item) => {
  const errors = {};
  if (!item.product_code?.trim()) errors.product_code = "Product ID is required.";
  if (!item.product_name?.trim()) errors.product_name = "Product name is required.";
  if (!normalizeCategory(item.category)) errors.category = `Choose one of: ${FOOD_CATEGORIES.join(", ")}.`;
  if (!Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0) errors.quantity = "Quantity must be greater than zero.";
  if (!item.unit?.trim()) errors.unit = "Unit is required.";
  if (!item.purchase_date) errors.purchase_date = "Purchase date is required.";
  if (!item.expiry_date) errors.expiry_date = "Expiry date is required.";
  if (item.purchase_date && item.expiry_date && new Date(item.expiry_date) < new Date(item.purchase_date)) errors.expiry_date = "Expiry must be on or after purchase date.";
  return errors;
};

const insertItem = async (client, businessId, raw) => {
  const item = clean(raw); item.category = normalizeCategory(item.category);
  const errors = validate(item); if (Object.keys(errors).length) { const error = new Error("Validation failed"); error.validation = errors; throw error; }
  const product = await client.query(`INSERT INTO product (business_id, sku, product_name, category, unit_price, barcode, storage_requirements)
    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING product_id`, [businessId, item.product_code.trim(), item.product_name.trim(), item.category, item.unit_price || item.selling_price || item.purchase_cost || 0, item.barcode, item.storage_type || "cool-dry"]);
  const inventory = await client.query(`INSERT INTO inventory (product_id, quantity, purchase_date, expiry_date, unit, supplier, batch_number, storage_type, purchase_cost, selling_price, barcode, notes, alert_days)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING inventory_id`, [product.rows[0].product_id, item.quantity, item.purchase_date, item.expiry_date, item.unit, item.supplier, item.batch_number, item.storage_type, item.purchase_cost, item.selling_price, item.barcode, item.notes, item.alert_days || 7]);
  return getById(client, businessId, inventory.rows[0].inventory_id);
};

const select = `SELECT i.inventory_id, p.product_id, p.sku AS product_code, p.product_name, p.category, p.unit_price, i.quantity, i.unit, i.purchase_date, i.expiry_date, i.supplier, i.batch_number, i.storage_type, i.purchase_cost, i.selling_price, COALESCE(i.barcode,p.barcode) AS barcode, i.notes, i.alert_days, i.created_at FROM inventory i JOIN product p ON p.product_id=i.product_id WHERE p.business_id=$1`;
const getById = async (client, businessId, id) => { const result = await client.query(`${select} AND i.inventory_id=$2`, [businessId, id]); return result.rows[0] ? withExpiryStatus(result.rows[0]) : null; };
const respondError = (res, error) => res.status(error.validation ? 400 : 500).json({ success: false, message: error.validation ? "Please correct the highlighted fields." : "Unable to process inventory.", errors: error.validation });

const scoreInventory = async (item, businessId) => {
  const client = await pool.connect();
  try { const prediction = await scoreAndPersistInventory(item, businessId, client); emitAiPredictionUpdated(businessId, prediction); return prediction; }
  finally { client.release(); }
};

export const addInventory = async (req, res) => { const client = await pool.connect(); try { await client.query("BEGIN"); const item = await insertItem(client, req.user.id, req.body); await client.query("COMMIT"); let prediction=null; try { prediction=await scoreInventory(item,req.user.id); } catch(error) { console.error("Unable to score newly added inventory:",error.message); } res.status(201).json({ success:true, message:"Inventory item added.", inventory:item, prediction }); } catch (error) { await client.query("ROLLBACK"); respondError(res, error); } finally { client.release(); } };

export const getInventory = async (req, res) => { try { const { search="", category="", status="", sort_by="expiry_date", order="asc" } = req.query; const sortColumns={expiry_date:"i.expiry_date",uploaded_at:"i.created_at",product_name:"p.product_name",product_id:"p.sku"}; const params=[req.user.id]; let query=select; if (search) { params.push(`%${search}%`); query += ` AND (p.product_name ILIKE $${params.length} OR p.sku ILIKE $${params.length} OR CAST(p.product_id AS TEXT) ILIKE $${params.length} OR COALESCE(i.barcode,p.barcode,'') ILIKE $${params.length})`; } if (category) { params.push(normalizeCategory(category) || category); query += ` AND p.category=$${params.length}`; } query += ` ORDER BY ${sortColumns[sort_by] || sortColumns.expiry_date} ${order.toLowerCase() === "desc" ? "DESC" : "ASC"}`; let inventory=(await pool.query(query,params)).rows.map(withExpiryStatus); if (status) inventory=inventory.filter((item)=>item.expiry.level===status); res.json({success:true,total:inventory.length,inventory,categories:FOOD_CATEGORIES}); } catch(error) { respondError(res,error); } };
export const getInventoryById = async (req,res) => { try { const inventory=await getById(pool,req.user.id,req.params.id); if(!inventory) return res.status(404).json({success:false,message:"Inventory item not found."}); res.json({success:true,inventory}); } catch(error) { respondError(res,error); } };
export const updateInventory = async (req,res) => { const client=await pool.connect(); try { const existing=await getById(client,req.user.id,req.params.id); if(!existing) return res.status(404).json({success:false,message:"Inventory item not found."}); const item={...existing,...clean(req.body)}; item.category=normalizeCategory(item.category); const errors=validate(item); if(Object.keys(errors).length){const error=new Error();error.validation=errors;throw error;} await client.query("BEGIN"); await client.query("UPDATE product SET sku=$1,product_name=$2,category=$3,unit_price=$4,barcode=$5,storage_requirements=$6 WHERE product_id=$7",[item.product_code,item.product_name,item.category,item.unit_price||0,item.barcode,item.storage_type||"cool-dry",existing.product_id]); await client.query("UPDATE inventory SET quantity=$1,unit=$2,purchase_date=$3,expiry_date=$4,supplier=$5,batch_number=$6,storage_type=$7,purchase_cost=$8,selling_price=$9,barcode=$10,notes=$11,alert_days=$12 WHERE inventory_id=$13",[item.quantity,item.unit,item.purchase_date,item.expiry_date,item.supplier,item.batch_number,item.storage_type,item.purchase_cost,item.selling_price,item.barcode,item.notes,item.alert_days||7,req.params.id]); await client.query("COMMIT"); const inventory=await getById(client,req.user.id,req.params.id); let prediction=null; try { prediction=await scoreInventory(inventory,req.user.id); } catch(error) { console.error("Unable to score updated inventory:",error.message); } res.json({success:true,message:"Inventory item updated.",inventory,prediction}); } catch(error) { await client.query("ROLLBACK");respondError(res,error); } finally { client.release(); } };
export const deleteInventory = async (req,res) => { try { const item=await getById(pool,req.user.id,req.params.id); if(!item)return res.status(404).json({success:false,message:"Inventory item not found."}); await pool.query("DELETE FROM inventory WHERE inventory_id=$1",[req.params.id]); res.json({success:true,message:"Inventory item deleted."}); } catch(error){respondError(res,error);} };
export const removeExpiredInventory = async (req,res) => { try { const result=await pool.query(`DELETE FROM inventory i USING product p WHERE i.product_id=p.product_id AND p.business_id=$1 AND i.expiry_date < CURRENT_DATE RETURNING i.inventory_id`,[req.user.id]); res.json({success:true,message:`Removed ${result.rowCount} expired item(s).`,removed:result.rowCount}); }catch(error){respondError(res,error);} };
export const removeInventoryItems = async (req,res) => { try { const ids=[...new Set((req.body.inventory_ids || []).map(Number).filter(Number.isInteger))]; if(!ids.length)return res.status(400).json({success:false,message:"Select at least one inventory item."}); const result=await pool.query(`DELETE FROM inventory i USING product p WHERE i.product_id=p.product_id AND p.business_id=$1 AND i.inventory_id = ANY($2::int[]) RETURNING i.inventory_id`,[req.user.id,ids]);res.json({success:true,message:`Removed ${result.rowCount} selected item(s).`,removed:result.rowCount}); }catch(error){respondError(res,error);} };
export const getExpiryAlerts = async (req,res) => { try { const result=await pool.query(`SELECT i.inventory_id,p.product_name,p.category,p.business_id,i.quantity,i.expiry_date,i.alert_days,pr.risk_score,pr.risk_tier,pr.reorder_recommendation,pr.predicted_at
  FROM inventory i JOIN product p ON p.product_id=i.product_id
  JOIN LATERAL (SELECT * FROM predictions WHERE inventory_id=i.inventory_id ORDER BY predicted_at DESC LIMIT 1) pr ON true
  WHERE p.business_id=$1 AND pr.risk_tier IN ('medium','high') ORDER BY pr.risk_score DESC, i.expiry_date`,[req.user.id]);
  const alerts=result.rows.map((item)=>({ ...item, days_to_expiry:getExpiryStatus(item.expiry_date,Number(item.alert_days||7)).daysRemaining, threshold_exceeded:getExpiryStatus(item.expiry_date,Number(item.alert_days||7)).level!=="safe", recommended_action:item.risk_tier==="high"?"Prioritize redistribution or discounting.":"Monitor demand and prepare a redistribution plan." })); res.json({success:true,alerts}); }catch(error){respondError(res,error);} };
export const lookupBarcode = async (req,res) => { try { const barcode=String(req.params.barcode||"").trim(); if(!barcode)return res.status(400).json({success:false,message:"Barcode is required."}); const result=await pool.query(`SELECT sku AS product_code,product_name,category,unit_price,barcode,storage_requirements FROM product WHERE business_id=$1 AND barcode=$2 LIMIT 1`,[req.user.id,barcode]); res.json({success:true,found:Boolean(result.rows[0]),product:result.rows[0]||{barcode}}); }catch(error){respondError(res,error);} };
export { insertItem };
