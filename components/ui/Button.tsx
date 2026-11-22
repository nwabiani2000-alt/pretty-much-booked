import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "pay";
};

/**
 * Design system PrimaryButton + research pack §1.
 * Primary = .btn-primary (56px, solid pmb-700). Secondary = TextLink.
 */
export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "no-select",
        variant === "primary" && "btn-primary",
        variant === "pay" && "btn-pay",
        variant === "ghost" && "btn-ghost min-h-touch",
        className
      )}
      {...props}
    />
  );
}

/** Secondary — design system `.btn-secondary` (text link). */
export function TextLink({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cn("btn-secondary", className)} {...props} />
  );
}
