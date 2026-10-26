"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText,
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className || "px-4 py-2 bg-pink-600 text-white text-sm font-semibold rounded-lg hover:bg-pink-500 disabled:opacity-50"}
    >
      {pending ? (pendingText || "Loading...") : children}
    </button>
  );
}
