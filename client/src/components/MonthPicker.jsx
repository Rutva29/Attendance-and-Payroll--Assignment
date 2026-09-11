export default function MonthPicker({ value, onChange, label = 'Month' }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        id="month-picker"
        type="month"
        value={value}
        onChange={(event) => event.target.value && onChange(event.target.value)}
        onClick={(event) => event.currentTarget.showPicker?.()}
      />
    </div>
  );
}
