/* eslint-disable @typescript-eslint/explicit-function-return-type */
import cn from "classnames";
import "./backdrop.scss";

export interface BackdropProps {
  isClosing?: boolean;
  children: React.ReactNode;
}

export function Backdrop({
  isClosing = false,
  children,
}: Readonly<BackdropProps>) {
  return (
    <div
      className={cn("backdrop", {
        "backdrop--closing": isClosing,
        "backdrop--windows": navigator.userAgent.includes("Windows"),
      })}
    >
      {children}
    </div>
  );
}