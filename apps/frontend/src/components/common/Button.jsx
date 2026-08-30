import "./common.css";

const VARIANT_CLASS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  ghost: "btn-ghost",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  size,
  block = false,
  className = "",
  children,
  ...rest
}) {
  const classes = [
    "btn",
    VARIANT_CLASS[variant] || VARIANT_CLASS.primary,
    size === "sm" ? "btn-sm" : "",
    block ? "btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
