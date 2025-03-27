import * as React from "react";
import "./input.scss";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
  containerClassName?: string;
  type?: string;
  className?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      containerClassName = "",
      error,
      label,
      type = "text",
      ...props
    },
    ref
  ) => {
    const inputId = React.useId();

    return (
      <div className={`input-root ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}

        <input
          id={inputId}
          type={type}
          className={`input-element ${error ? "error" : ""} ${className}`}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />

        {error && (
          <p id={`${inputId}-error`} className="input-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };

