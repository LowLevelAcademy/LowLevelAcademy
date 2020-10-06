import React from "react";

export const SegmentedButtonSet: React.FC = ({ children }) => (
  <div className="segmented-button">{children}</div>
);

type Button = JSX.IntrinsicElements["button"];

interface SegmentedButtonProps extends Button {
  isBuild?: boolean;
}

export const SegmentedButton = React.forwardRef<
  HTMLButtonElement,
  SegmentedButtonProps
>(({ isBuild, children, ...props }, ref) => (
  <button
    ref={ref}
    {...props}
    className={`segmented-button__button ${
      isBuild ? "segmented-button__button--build" : ""
    }`}
  >
    {children}
  </button>
));
SegmentedButton.displayName = "SegmentedButton";
