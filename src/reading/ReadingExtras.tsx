import { useState, type ReactNode } from "react";

export default function ReadingExtras({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose?: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="reading-extras"
      onToggle={(event) => {
        const next = event.currentTarget.open;
        setOpen(next);
        if (!next) onClose?.();
      }}
    >
      <summary>
        {title}
        <small>{subtitle}</small>
      </summary>
      {open && children}
    </details>
  );
}
