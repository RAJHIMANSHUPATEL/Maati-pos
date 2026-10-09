import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { formatMoney, roundMoney } from "../utils/money";
import { isWeightedUnit, unitLabel } from "../utils/units";
import { useBag } from "../context/BagContext";
import { useTill } from "../context/TillContext";

const qtyText = (line) =>
  isWeightedUnit(line.quantityUnit)
    ? `${Number(line.weight).toFixed(3)} ${unitLabel(line.quantityUnit)}`
    : `${line.quantity} ${unitLabel(line.quantityUnit)}`;

const BagPanel = () => {
  const navigate = useNavigate();
  const { session } = useTill();
  const { items, setQty, setWeight, remove, clear, subTotal, lineTotal } = useBag();
  const [selected, setSelected] = useState("");
  const surcharge = Number(session?.till?.surcharge || 0);
  const total = roundMoney(subTotal + surcharge);
  const count = items.reduce(
    (sum, line) => sum + (isWeightedUnit(line.quantityUnit) ? 1 : Number(line.quantity)),
    0
  );

  useEffect(() => {
    if (!items.length) {
      setSelected("");
      return;
    }
    if (!items.some((line) => line.product === selected)) {
      setSelected(items[items.length - 1].product);
    }
  }, [items, selected]);

  const selectedLine = items.find((line) => line.product === selected);

  const bumpQty = (delta) => {
    if (!selectedLine || isWeightedUnit(selectedLine.quantityUnit)) return;
    setQty(selectedLine.product, selectedLine.quantity + delta);
  };

  return (
    <aside className="flex h-full min-h-0 flex-col bg-ticket text-ink">
      <div className="flex items-center justify-between bg-chrome-2 px-3 py-1.5 text-[0.7rem] font-extrabold uppercase tracking-wider text-white">
        <span>Transaction</span>
        <span>{count} item{count === 1 ? "" : "s"}</span>
      </div>
      <div className="grid grid-cols-[2.2rem_1fr_4.6rem_5.4rem] border-b border-black/20 bg-panel px-2 py-1 font-mono text-[0.65rem] font-bold uppercase">
        <span>#</span>
        <span>Item</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Amt</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-ink/50">
            Scan or tap an item to ring it up.
          </p>
        ) : (
          <ul>
            {items.map((line, idx) => {
              const active = line.product === selected;
              const weighted = isWeightedUnit(line.quantityUnit);
              return (
                <li key={line.product}>
                  <button
                    type="button"
                    onClick={() => setSelected(line.product)}
                    className={`grid w-full grid-cols-[2.2rem_1fr_4.6rem_5.4rem] items-start px-2 py-1.5 text-left font-mono text-xs ${
                      active ? "bg-pay/40" : idx % 2 ? "bg-black/5" : ""
                    }`}
                  >
                    <span>{idx + 1}</span>
                    <span className="pr-2 font-sans text-[0.8rem] font-semibold leading-tight">
                      {line.name}
                      <span className="block font-mono text-[0.65rem] font-normal text-ink/55">
                        {formatMoney(line.posPrice)}/{unitLabel(line.quantityUnit)}
                      </span>
                    </span>
                    <span className="text-right tabular-nums">{qtyText(line)}</span>
                    <span className="text-right font-bold tabular-nums">
                      {formatMoney(lineTotal(line))}
                    </span>
                  </button>
                  {active ? (
                    <div className="flex items-center gap-2 border-t border-black/10 bg-panel px-2 py-1.5">
                      {weighted ? (
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          value={line.weight}
                          onChange={(e) => setWeight(line.product, e.target.value)}
                          className="w-24 border border-key-edge bg-white px-2 py-1 font-mono text-sm"
                        />
                      ) : (
                        <>
                          <button type="button" className="pos-key h-8 w-8" onClick={() => bumpQty(-1)}>
                            −
                          </button>
                          <span className="w-8 text-center font-mono">{line.quantity}</span>
                          <button type="button" className="pos-key h-8 w-8" onClick={() => bumpQty(1)}>
                            +
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(line.product)}
                        className="pos-fkey ml-auto h-8 bg-void px-3 text-white"
                      >
                        Void line
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="border-t border-black/30 bg-panel px-3 py-2 text-xs">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-mono tabular-nums">{formatMoney(subTotal)}</span>
        </div>
        {surcharge > 0 ? (
          <div className="flex justify-between">
            <span>Surcharge</span>
            <span className="font-mono tabular-nums">{formatMoney(surcharge)}</span>
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-between bg-led px-3 py-2">
        <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-led-fg/80">
          Total
        </span>
        <span className="font-mono text-4xl font-bold tabular-nums leading-none text-led-fg">
          {formatMoney(total)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 bg-chrome-2 p-1.5">
        <button
          type="button"
          disabled={!items.length}
          onClick={clear}
          className="pos-fkey bg-void text-white disabled:opacity-40"
        >
          Void all
        </button>
        <button
          type="button"
          disabled={!items.length}
          onClick={() => navigate("/pay")}
          className="pos-fkey bg-pay text-ink disabled:opacity-40"
        >
          Cash tender
        </button>
      </div>
    </aside>
  );
};

export default BagPanel;
