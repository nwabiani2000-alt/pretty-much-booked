"use client";

import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useId, useState } from "react";

type FieldState = "default" | "error" | "success";

type UnderlineFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "placeholder"
> & {
  label: string;
  hintPlaceholder?: string;
  state?: FieldState;
  errorText?: string;
};

/** Design system Input — underline only + floating label (research §4). */
export function UnderlineField({
  label,
  hintPlaceholder,
  state = "default",
  errorText,
  className,
  value,
  defaultValue,
  onFocus,
  onBlur,
  ...props
}: UnderlineFieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const filled = Boolean(
    (value !== undefined && String(value).length > 0) ||
      (defaultValue !== undefined && String(defaultValue).length > 0)
  );
  const float = focused || filled;

  return (
    <div className={cn("relative", className)}>
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-0 origin-left text-neutral-secondary transition-all duration-fast ease-premium",
          float ? "top-0 text-caption" : "top-3.5 text-body"
        )}
      >
        {float ? label : hintPlaceholder || label}
      </label>
      <input
        id={id}
        value={value}
        defaultValue={defaultValue}
        placeholder={focused ? hintPlaceholder || label : " "}
        className={cn(
          "input pt-5",
          state === "error" && "input-error",
          state === "success" && "input-success"
        )}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {state === "success" && (
        <span
          className="absolute right-0 top-5 animate-check-pop text-small text-success"
          aria-hidden
        >
          ✓
        </span>
      )}
      {state === "error" && errorText && (
        <p className="mt-1 text-caption text-error">{errorText}</p>
      )}
    </div>
  );
}

type UnderlineTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "placeholder"
> & {
  label: string;
  state?: FieldState;
};

export function UnderlineTextarea({
  label,
  state = "default",
  className,
  value,
  onFocus,
  onBlur,
  ...props
}: UnderlineTextareaProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const filled = Boolean(value !== undefined && String(value).length > 0);
  const float = focused || filled;

  return (
    <div className={cn("relative", className)}>
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-0 origin-left text-neutral-secondary transition-all duration-fast ease-premium",
          float ? "top-0 text-caption" : "top-3.5 text-body"
        )}
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        placeholder=" "
        className={cn(
          "input min-h-[6rem] resize-none pt-5",
          state === "error" && "input-error"
        )}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
    </div>
  );
}
