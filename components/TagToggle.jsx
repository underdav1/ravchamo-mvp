export default function TagToggle({ label, selected, onClick }) {
  return (
    <button
      type="button"
      className={`tag ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
