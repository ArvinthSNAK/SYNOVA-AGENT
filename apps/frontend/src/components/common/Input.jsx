import "./common.css";

export default function Input({ label, id, className = "", ...rest }) {
  const inputEl = <input id={id} className={`input ${className}`.trim()} {...rest} />;

  if (!label) return inputEl;

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {inputEl}
    </div>
  );
}
