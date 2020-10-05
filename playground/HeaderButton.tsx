import React from "react";

interface HeaderButtonProps {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const HeaderButton: React.FC<HeaderButtonProps> = ({
  icon,
  rightIcon,
  children,
}) => {
  const c = ["header-button"];

  if (icon) {
    c.push("header-button--has-left-icon");
  }
  if (rightIcon) {
    c.push("header-button--has-right-icon");
  }
  if ((icon || rightIcon) && !children) {
    c.push("header-button--icon-only");
  }

  return (
    <div className={c.join(" ")}>
      {icon && <div className="header-button__left-icon">{icon}</div>}
      {children}
      {rightIcon && (
        <div className="header-button__right-icon">{rightIcon}</div>
      )}
    </div>
  );
};

export default HeaderButton;
