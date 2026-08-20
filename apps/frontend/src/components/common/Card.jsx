import "./common.css";

export default function Card({ className = "", padded = true, children, ...rest }) {
  const classes = ["card", padded ? "card-pad" : "", className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
