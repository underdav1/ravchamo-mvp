"use client";

export default function TagToggle({ label, selected, onClick, className = "" }) {
  return (
    <button
      type="button"
      aria-pressed={!!selected}
      onClick={onClick}
      className={[
        "tag",               // your base chip styles from globals.css
        selected ? "selected" : "",
        className,
      ].join(" ").trim()}
    >
      {label}
    </button>
  );
}
