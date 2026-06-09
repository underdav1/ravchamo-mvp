// Shared price formatter — used by DishCard and the dish detail page so
// rendering stays consistent.
//
// Inputs vary by call site:
//   - From the RPC: `priceNumeric` is a clean number (e.g. 23.50)
//   - From the dish detail page's direct query: `price_numeric` is the column name
// Both should produce the same output here.
//
// Returns:
//   - "₾23.50" when a parseable price is present
//   - null when there isn't one (callers decide how to render the absence)

export function formatPrice(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseFloat(value);
  if (!Number.isFinite(n)) return null;
  // Always show two decimals to look intentional (e.g. "₾23.00", not "₾23")
  return `₾${n.toFixed(2)}`;
}
