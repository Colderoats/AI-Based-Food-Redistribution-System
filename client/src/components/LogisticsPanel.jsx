import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../services/api";

const initialForm = { vehicle_type: "Van", capacity_kg: "", available_from: "", available_until: "", service_area: "", contact_phone: "", notes: "" };

function LogisticsPanel({ onClose }) {
  const [availability, setAvailability] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const loadAvailability = async () => {
    try { const { data } = await api.get("/logistics/availability"); setAvailability(data.availability); } catch { setMessage("Logistics data will be available once the database migration is applied."); }
  };
  useEffect(() => {
    // Load the persisted availability once when the panel opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAvailability();
  }, []);
  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/logistics/availability", form);
      setForm(initialForm); setMessage("Availability saved."); loadAvailability();
    } catch (error) { setMessage(error.response?.data?.message || "Could not save availability."); }
  };
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
    <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 shadow-2xl">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4"><div><h2 className="text-xl font-semibold">Pickup logistics</h2><p className="text-sm text-slate-400">Availability and capacity dashboard</p></div><button onClick={onClose} className="rounded p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close"><X /></button></header>
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <form onSubmit={submit} className="space-y-3"><h3 className="font-semibold">Add logistics availability</h3>
          <select name="vehicle_type" value={form.vehicle_type} onChange={change} className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2"><option>Van</option><option>Truck</option><option>Refrigerated vehicle</option><option>Volunteer pickup</option></select>
          <input required name="capacity_kg" type="number" min="1" value={form.capacity_kg} onChange={change} placeholder="Capacity (kg)" className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2" />
          <label className="block text-sm text-slate-300">Available from<input required name="available_from" type="datetime-local" value={form.available_from} onChange={change} className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2" /></label>
          <label className="block text-sm text-slate-300">Available until<input required name="available_until" type="datetime-local" value={form.available_until} onChange={change} className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2" /></label>
          <input required name="service_area" value={form.service_area} onChange={change} placeholder="Service area" className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2" />
          <input name="contact_phone" value={form.contact_phone} onChange={change} placeholder="Contact phone" className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2" />
          <textarea name="notes" value={form.notes} onChange={change} placeholder="Notes for coordinators" className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2" />
          <button className="rounded bg-emerald-500 px-4 py-2 font-semibold hover:bg-emerald-600">Save availability</button>{message && <p className="text-sm text-emerald-300">{message}</p>}
        </form>
        <div><h3 className="mb-3 font-semibold">Current availability</h3>{availability.length ? <div className="space-y-3">{availability.map((item) => <div key={item.logistics_id} className="rounded border border-slate-700 p-4"><p className="font-medium">{item.vehicle_type} · {item.capacity_kg} kg</p><p className="mt-1 text-sm text-slate-400">{item.service_area}</p><p className="mt-2 text-xs text-slate-500">{new Date(item.available_from).toLocaleString()} to {new Date(item.available_until).toLocaleString()}</p></div>)}</div> : <p className="rounded border border-dashed border-slate-700 p-5 text-sm text-slate-400">No availability has been added yet.</p>}</div>
      </div>
    </section>
  </div>;
}
export default LogisticsPanel;
