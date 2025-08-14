export default function BigButton({ className="", children, ...props }) {
  return (
    <button className={`kahoot-btn ${className}`} {...props}>
      {children}
    </button>
  );
}
