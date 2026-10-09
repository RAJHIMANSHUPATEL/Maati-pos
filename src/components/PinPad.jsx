import NumPad from "./NumPad";

const PinPad = ({ value, onChange, onComplete, disabled }) => {
  const pushDigit = (digit) => {
    if (value.length >= 4) return;
    const next = `${value}${digit}`;
    onChange(next);
    if (next.length === 4) onComplete?.(next);
  };

  return (
    <div>
      <div className="mb-4 flex justify-center gap-3" aria-label="PIN digits">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border-2 border-chrome ${
              value.length > i ? "bg-chrome" : "bg-white"
            }`}
          />
        ))}
      </div>
      <NumPad
        mode="pin"
        disabled={disabled}
        onDigit={pushDigit}
        onClear={() => onChange("")}
        onBack={() => onChange(value.slice(0, -1))}
      />
    </div>
  );
};

export default PinPad;
