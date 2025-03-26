import cn from "classnames";

import "./button.scss";

export interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  theme?: "primary" | "outline" | "dark" | "danger";
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Button({
  children,
  theme = "primary",
  className,
  ...props
}: Readonly<ButtonProps>) {
  return (
    <button
      type="button"
      className={cn("button", `button--${theme}`, className)}
      {...props}
    >
      {children}
    </button>
  );
}
