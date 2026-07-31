function PasswordStrength({ password }) {
  let strength = 0;

  if (password.length >= 6) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ];

  const labels = [
    "Weak",
    "Fair",
    "Good",
    "Strong",
  ];

  return (
    <div className="mb-5">

      <div className="w-full bg-slate-700 rounded-full h-2">

        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            colors[strength - 1] || "bg-red-500"
          }`}
          style={{
            width: `${(strength / 4) * 100}%`,
          }}
        />

      </div>

      <p className="text-sm text-gray-400 mt-2">
        {labels[strength - 1] || "Very Weak"}
      </p>

    </div>
  );
}

export default PasswordStrength;