import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { posApi } from "../api/client";
import { useBag } from "../context/BagContext";
import { useTill } from "../context/TillContext";
import Receipt from "../components/Receipt";
import NumPad from "../components/NumPad";
import { formatMoney, roundMoney } from "../utils/money";
import { isWeightedUnit, unitLabel } from "../utils/units";

const NOTES = [50, 100, 200, 500, 2000];

const Pay = () => {
  const navigate = useNavigate();
  const { session } = useTill();
  const { items, notes, setNotes, subTotal, clear, lineTotal } = useBag();
  const [tender, setTender] = useState("");
  const [busy, setBusy] = useState(false);
  const [sale, setSale] = useState(null);

  const surcharge = Number(session?.till?.surcharge || 0);
  const total = roundMoney(subTotal + surcharge);
  const tenderNum = Number(tender);
  const change = tenderNum >= total ? roundMoney(tenderNum - total) : 0;
  const canPay = items.length > 0 && tenderNum >= total && !busy;

  const payloadItems = useMemo(
    () =>
      items.map((line) =>
        isWeightedUnit(line.quantityUnit)
          ? { product: line.product, weight: Number(line.weight) }
          : { product: line.product, quantity: Number(line.quantity) }
      ),
    [items]
  );

  if (!items.length && !sale) {
    return <Navigate to="/sell" replace />;
  }

  const onDigit = (d) => {
    if (d === "." && String(tender).includes(".")) return;
    setTender((prev) => `${prev}${d}`);
  };

  const complete = async () => {
    if (!canPay) return;
    setBusy(true);
    try {
      const res = await posApi.sale({
        items: payloadItems,
        tender_amount: roundMoney(tenderNum),
        notes,
      });
      setSale(res.data);
      clear();
    } catch (error) {
      toast.error(error.message || "Sale failed");
    } finally {
      setBusy(false);
    }
  };

  const printReceipt = async () => {
    window.print();
    if (sale?._id) {
      try {
        await posApi.printed(sale._id);
      } catch {
        /* reprint still works */
      }
    }
  };

  if (sale) {
    return (
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_22rem]">
        <div className="overflow-auto bg-desk p-4">
          <div className="mx-auto w-[74mm] border border-black/30 bg-white shadow-lg">
            <Receipt order={sale} till={session?.till} />
          </div>
        </div>
        <div className="flex flex-col gap-2 bg-panel p-3 print:hidden">
          <p className="bg-ok px-3 py-2 text-center text-sm font-extrabold uppercase tracking-wider text-white">
            Sale complete
          </p>
          <button type="button" onClick={printReceipt} className="pos-fkey bg-chrome text-white">
            Print invoice
          </button>
          <button
            type="button"
            onClick={() => navigate("/sell")}
            className="pos-fkey bg-pay text-ink"
          >
            New transaction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="flex min-h-0 flex-col bg-ticket">
        <div className="bg-chrome-2 px-3 py-1.5 text-[0.7rem] font-extrabold uppercase tracking-wider text-white">
          Tender — cash
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto p-3 font-mono text-sm">
          {items.map((line) => (
            <li key={line.product} className="flex justify-between border-b border-black/10 py-1">
              <span className="pr-3 font-sans font-semibold">
                {line.name}
                <span className="block text-[0.7rem] font-normal text-ink/55">
                  {isWeightedUnit(line.quantityUnit)
                    ? `${Number(line.weight).toFixed(3)} ${unitLabel(line.quantityUnit)}`
                    : `${line.quantity} ${unitLabel(line.quantityUnit)}`}
                </span>
              </span>
              <span className="tabular-nums">{formatMoney(lineTotal(line))}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-black/20 bg-panel px-3 py-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono">{formatMoney(subTotal)}</span>
          </div>
          {surcharge > 0 ? (
            <div className="flex justify-between">
              <span>Surcharge</span>
              <span className="font-mono">{formatMoney(surcharge)}</span>
            </div>
          ) : null}
          <label className="mt-2 block text-xs font-bold uppercase">
            Note
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full border border-key-edge bg-white px-2 py-1 font-sans"
              placeholder="Optional"
            />
          </label>
        </div>
        <div className="bg-led px-3 py-3">
          <div className="flex justify-between text-led-fg/70">
            <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em]">Amount due</span>
            <span className="font-mono text-3xl font-bold tabular-nums text-led-fg">
              {formatMoney(total)}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-led-fg/70">
            <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em]">Change</span>
            <span className="font-mono text-3xl font-bold tabular-nums text-pay">
              {formatMoney(tenderNum >= total ? change : 0)}
            </span>
          </div>
        </div>
      </section>
      <section className="flex min-h-0 flex-col bg-panel p-2">
        <p className="text-[0.7rem] font-extrabold uppercase tracking-wider">Cash received</p>
        <div className="mt-1 bg-led px-3 py-3 text-right font-mono text-3xl tabular-nums text-led-fg">
          {tender === "" ? "0.00" : tender}
        </div>
        {tender !== "" && tenderNum < total ? (
          <p className="mt-1 text-xs font-bold text-void">Tender is less than amount due</p>
        ) : null}
        <div className="mt-2 grid grid-cols-3 gap-1">
          <button type="button" onClick={() => setTender(String(total))} className="pos-key py-2 text-xs">
            Exact
          </button>
          {NOTES.map((note) => (
            <button
              key={note}
              type="button"
              onClick={() => setTender(String(Math.max(note, total)))}
              className="pos-key py-2 text-xs"
            >
              ₹{note}
            </button>
          ))}
        </div>
        <NumPad
          className="mt-2"
          disabled={busy}
          onDigit={onDigit}
          onClear={() => setTender("")}
          onBack={() => setTender((v) => v.slice(0, -1))}
        />
        <button
          type="button"
          disabled={!canPay}
          onClick={complete}
          className="pos-fkey mt-2 bg-ok text-white disabled:opacity-40"
        >
          {busy ? "Posting…" : "Tender cash"}
        </button>
        <button type="button" onClick={() => navigate("/sell")} className="pos-fkey mt-1 bg-chrome text-white">
          Back to register
        </button>
      </section>
    </div>
  );
};

export default Pay;
