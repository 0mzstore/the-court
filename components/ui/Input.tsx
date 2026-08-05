import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, id, ...props }: InputProps) {
  return (
    <div className="mb-3.5">
      <label
        htmlFor={id}
        className="block text-[11.5px] font-bold uppercase tracking-wide text-ink-600 mb-1.5"
      >
        {label}
      </label>
      <input
        id={id}
        className="w-full text-sm px-3 py-[9px] rounded-lg border border-black/10 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-court-600"
        {...props}
      />
    </div>
  );
}
