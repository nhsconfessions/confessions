import { useEffect } from "react";

export default function Modal({ open, onClose, children, className = "" }) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={`readme_modal_overlay ${open ? "active" : ""}`}
      role="dialog"
      aria-modal="true"
      onClick={(event) => event.target === event.currentTarget && onClose()}
      onWheel={(event) => event.target === event.currentTarget && event.preventDefault()}
      onTouchMove={(event) => event.target === event.currentTarget && event.preventDefault()}
    >
      <div className={`readme_modal_content ${className}`}>
        {children}
      </div>
    </div>
  );
}
