const PIN_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "←"];
const MONEY_KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "00", "0", "."];

const NumPad = ({ mode = "money", onDigit, onClear, onBack, disabled, className = "" }) => {
  const keys = mode === "pin" ? PIN_KEYS : MONEY_KEYS;

  const press = (key) => {
    if (disabled) return;
    if (key === "C") onClear?.();
    else if (key === "←") onBack?.();
    else onDigit?.(key);
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-3 gap-1.5">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => press(key)}
            className="pos-key h-14 text-2xl text-ink"
          >
            {key === "←" ? "⌫" : key}
          </button>
        ))}
      </div>
      {mode === "money" ? (
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          <button type="button" disabled={disabled} onClick={() => press("C")} className="pos-key h-12 text-lg">
            CLR
          </button>
          <button type="button" disabled={disabled} onClick={() => press("←")} className="pos-key h-12 text-lg">
            ⌫
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default NumPad;
