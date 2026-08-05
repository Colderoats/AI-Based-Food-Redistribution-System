import BarcodeScanner from "./BarcodeScanner";

const categories = ["Fruits","Vegetables","Dairy","Meat","Poultry","Seafood","Bakery","Beverages","Frozen Foods","Dry Goods","Ready-to-Eat","Snacks","Condiments","Grains","Spices","Other"];
const fields = [
  ["product_code","Product ID","text",true],["product_name","Product name","text",true],["category","Category","select",true],["quantity","Quantity","number",true],["unit","Unit","text",true],
  ["purchase_date","Purchase date","date",true],["expiry_date","Expiry date","date",true],["supplier","Supplier","text"],["batch_number","Batch number","text"],
  ["storage_type","Storage type","select"],["purchase_cost","Purchase cost","number"],["selling_price","Selling price (optional)","number"],["barcode","Barcode / QR value","text"],["notes","Notes","textarea"],
];

function InventoryForm({ isOpen, formData, setFormData, onSubmit, onClose, saving, title = "Add inventory" }) {
  if (!isOpen) return null;
  const change = (event) => setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  const handleSubmit = (event) => { event.preventDefault(); onSubmit(); };
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4"><div className="mx-auto my-6 w-full max-w-4xl rounded-2xl bg-white p-6 text-slate-900 shadow-2xl">
    <div className="mb-5 flex items-center justify-between"><div><h2 className="text-2xl font-bold">{title}</h2><p className="text-sm text-slate-500">Fields marked * are required. You can edit barcode results before saving.</p></div><button type="button" onClick={onClose} className="text-2xl text-slate-500">×</button></div>
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">{fields.map(([name,label,type,required]) => <label key={name} className={name === "notes" ? "md:col-span-2" : ""}><span className="mb-1 block text-sm font-medium">{label}{required && " *"}</span>{type === "select" ? <select name={name} required={required} value={formData[name] || ""} onChange={change} className="w-full rounded-lg border border-slate-300 p-2.5">{name === "category" ? <><option value="">Select category</option>{categories.map((category)=><option key={category}>{category}</option>)}</> : <><option value="">Select storage</option><option>Ambient</option><option>Refrigerated</option><option>Frozen</option><option>Cool dry</option></>}</select> : type === "textarea" ? <textarea name={name} value={formData[name] || ""} onChange={change} rows="3" className="w-full rounded-lg border border-slate-300 p-2.5" /> : <input name={name} type={type} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} required={required} value={formData[name] || ""} onChange={change} className="w-full rounded-lg border border-slate-300 p-2.5" />}</label>)}</form>
    <div className="mt-5"><BarcodeScanner onBarcodeDetected={(barcode, product) => setFormData((previous) => ({...previous, barcode, ...(product || {})}))} /></div>
    <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-lg border px-5 py-2.5">Cancel</button><button type="button" disabled={saving} onClick={handleSubmit} className="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save item"}</button></div>
  </div></div>;
}
export default InventoryForm;
