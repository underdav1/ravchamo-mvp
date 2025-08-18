"use client";

export default function TagToggle({ label, selected, onClick, className = "" }) {
  return (
    <button
      type="button"
      aria-pressed={!!selected}
      onClick={onClick}
      className={[
        "tag",
        selected ? "selected" : "",
        className,
      ].join(" ").trim()}
    >
      {label}
    </button>
  );
}
