"use client";

type ConfirmSubmitButtonProps = {
  label: string;
  confirmText: string;
  className?: string;
};

export default function ConfirmSubmitButton({
  label,
  confirmText,
  className,
}: ConfirmSubmitButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={(event) => {
        const form = event.currentTarget.form;
        if (!form) return;
        if (!window.confirm(confirmText)) return;
        form.requestSubmit();
      }}
    >
      {label}
    </button>
  );
}

