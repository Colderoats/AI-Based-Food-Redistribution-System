import { Eye, EyeOff } from "lucide-react";

function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  showPassword,
  setShowPassword,
}) {
  const isPassword = type === "password";

  return (
    <div className="mb-5">
      <label className="block text-gray-300 mb-2 font-medium">
        {label}
      </label>

      <div className="relative">
        <input
          type={
            isPassword
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
          className="
          w-full
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
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3.5 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default InputField;