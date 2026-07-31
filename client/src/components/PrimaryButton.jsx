function PrimaryButton({
  children,
  onClick,
  type = "button",
  loading = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="
        w-full
        rounded-xl
        bg-emerald-500
        hover:bg-emerald-600
        py-3
        text-lg
        font-semibold
        transition
        duration-300
        disabled:opacity-60
        disabled:cursor-not-allowed
      "
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

export default PrimaryButton;