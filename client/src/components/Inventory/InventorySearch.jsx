function InventorySearch({
  searchTerm,
  setSearchTerm,
}) {
  return (
    <div className="w-full md:w-96">
      <input
        type="text"
        placeholder="Search by product or category..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}

export default InventorySearch;