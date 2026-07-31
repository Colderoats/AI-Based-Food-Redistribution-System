import { ChevronDown } from "lucide-react";

function RoleSelector({ value, onChange }) {
  return (
    <div className="mb-5">
      <label className="block mb-2 text-gray-300 font-medium">
        Business Type
      </label>

      <div className="relative">
        <select
          name="businessType"
          value={value}
          onChange={onChange}
          className="
            w-full
            appearance-none
            rounded-xl
            bg-slate-900
            border
            border-slate-700
            px-5
            py-3
            text-white
            outline-none
            transition
            duration-300
            focus:border-emerald-400
            focus:ring-2
            focus:ring-emerald-400/20
          "
        >
          <option value="">Select Business Type</option>

          <option value="Restaurant">Restaurant</option>

          <option value="Supermarket">Supermarket</option>

          <option value="Bakery">Bakery</option>

          <option value="Hotel">Hotel</option>

          <option value="Cafe">Cafe</option>

          <option value="Catering Service">
            Catering Service
          </option>

          <option value="Food Manufacturer">
            Food Manufacturer
          </option>
        </select>

        <ChevronDown
          size={20}
          className="absolute right-4 top-4 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

export default RoleSelector;