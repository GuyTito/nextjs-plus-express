import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function Button({
  children,
  className,
  variant = "primary",
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        "flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
        variant === "primary"
          ? "bg-blue-500 text-white hover:bg-blue-400 active:bg-blue-600"
          : "bg-white text-blue-500 border border-blue-500 hover:bg-blue-50 active:bg-blue-100",
        className,
      )}
    >
      {children}
    </button>
  );
}
