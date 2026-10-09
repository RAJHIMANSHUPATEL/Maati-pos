import { useEffect, useRef, useState } from "react";
import { formatMoney } from "../utils/money";
import { unitLabel } from "../utils/units";
import NumPad from "./NumPad";

const WeightSheet = ({ product, open, onClose, onAdd }) => {
  const dialogRef = useRef(null);
  const [weight, setWeight] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      setWeight("");
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!product) return null;

  const kg = Number(weight);
  const valid = kg > 0;
  const preview = valid ? Number(product.posPrice) * kg : 0;

  const onDigit = (d) => {
    if (d === "." && weight.includes(".")) return;
    setWeight((prev) => `${prev}${d}`);
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[min(94vw,26rem)] border border-key-edge bg-panel p-0 text-ink shadow-2xl"
    >
      <div className="bg-chrome px-4 py-2 text-sm font-extrabold uppercase tracking-wider text-white">
        Enter weight
      </div>
      <div className="p-4">
        <p className="text-sm font-bold">{product.name}</p>
        <p className="font-mono text-xs text-ink/60">
          {formatMoney(product.posPrice)} / {unitLabel(product.quantityUnit)}
        </p>
        <div className="mt-3 bg-led px-3 py-3 text-right font-mono text-3xl tabular-nums text-led-fg">
          {weight || "0.000"} {unitLabel(product.quantityUnit)}
        </div>
        <p className="mt-1 text-right text-sm font-semibold">{formatMoney(preview)}</p>
        <div className="mt-3 flex gap-1">
          {["0.250", "0.500", "1.000"].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setWeight(preset)}
              className="pos-key flex-1 py-2 text-xs"
            >
              {preset}
            </button>
          ))}
        </div>
        <NumPad
          className="mt-3"
          onDigit={onDigit}
          onClear={() => setWeight("")}
          onBack={() => setWeight((w) => w.slice(0, -1))}
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="pos-fkey bg-panel">
            Cancel
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={() => onAdd(kg)}
            className="pos-fkey bg-ok text-white disabled:opacity-40"
          >
            Add item
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default WeightSheet;
