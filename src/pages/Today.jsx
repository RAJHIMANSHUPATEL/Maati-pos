import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { posApi } from "../api/client";
import { useTill } from "../context/TillContext";
import Receipt from "../components/Receipt";
import PinPad from "../components/PinPad";
import { formatMoney } from "../utils/money";

const Today = () => {
  const { session } = useTill();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reprint, setReprint] = useState(null);
  const [voiding, setVoiding] = useState("");
  const [voidTarget, setVoidTarget] = useState(null);
  const [mgrPin, setMgrPin] = useState("");

  const needsOverride = session?.cashier?.role === "cashier";

  const load = async () => {
    setLoading(true);
    try {
      const res = await posApi.today();
      setSales(res.data || []);
    } catch (error) {
      toast.error(error.message || "Could not load today's sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const printSale = async (order) => {
    setReprint(order);
    window.setTimeout(() => window.print(), 80);
    try {
      await posApi.printed(order._id);
      setSales((prev) =>
        prev.map((row) => (row._id === order._id ? { ...row, isPrinted: true } : row))
      );
    } catch {
      /* still printed locally */
    }
  };

  const doVoid = async (order, pin) => {
    setVoiding(order._id);
    try {
      const res = await posApi.voidSale(order._id, pin);
      setSales((prev) => prev.map((row) => (row._id === order._id ? res.data : row)));
      toast.success("Sale voided");
      setVoidTarget(null);
      setMgrPin("");
    } catch (error) {
      toast.error(error.message || "Could not void");
      setMgrPin("");
    } finally {
      setVoiding("");
    }
  };

  const voidSale = (order) => {
    if (!window.confirm(`Void ${order.order_number}? This cannot be undone today.`)) {
      return;
    }
    if (needsOverride) {
      setVoidTarget(order);
      setMgrPin("");
      return;
    }
    doVoid(order);
  };

  return (
    <div className="h-full overflow-auto bg-desk p-3">
      <div className="bg-chrome px-3 py-2 text-sm font-extrabold uppercase tracking-wider text-white">
        Daily journal
      </div>
      {loading ? (
        <p className="mt-6 font-mono text-sm text-ink/70">LOADING…</p>
      ) : sales.length === 0 ? (
        <p className="mt-6 font-mono text-sm text-ink/70">NO TRANSACTIONS TODAY</p>
      ) : (
        <table className="mt-0 w-full border-collapse bg-ticket font-mono text-sm">
          <thead className="bg-panel text-left text-[0.7rem] uppercase">
            <tr>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Invoice</th>
              <th className="px-3 py-2">Cashier</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((order) => {
              const voided = order.order_status === "cancelled";
              return (
                <tr key={order._id} className="border-t border-black/10">
                  <td className="px-3 py-2">
                    {new Date(order.createdAt).toLocaleTimeString("en-IN")}
                  </td>
                  <td className="px-3 py-2 font-bold">{order.order_number}</td>
                  <td className="px-3 py-2">{order.cashier_name || "—"}</td>
                  <td className="px-3 py-2 uppercase">{voided ? "void" : "paid"}</td>
                  <td className="px-3 py-2 text-right">{formatMoney(order.grand_total)}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => printSale(order)}
                      className="pos-fkey mr-1 inline-block h-8 bg-chrome px-2 text-white"
                    >
                      Reprint
                    </button>
                    <button
                      type="button"
                      disabled={voided || voiding === order._id}
                      onClick={() => voidSale(order)}
                      className="pos-fkey inline-block h-8 bg-void px-2 text-white disabled:opacity-40"
                    >
                      Void
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {voidTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="w-full max-w-xs border border-black/40 bg-panel p-5">
            <p className="text-center text-sm font-extrabold uppercase tracking-wider">
              Manager override
            </p>
            <p className="mt-1 text-center text-xs text-ink/70">
              Enter manager PIN to void {voidTarget.order_number}
            </p>
            <div className="mt-4">
              <PinPad
                value={mgrPin}
                onChange={setMgrPin}
                onComplete={(pin) => doVoid(voidTarget, pin)}
                disabled={voiding === voidTarget._id}
              />
            </div>
            <button
              type="button"
              className="mt-3 w-full text-center text-xs font-bold uppercase tracking-wider text-ink/60"
              onClick={() => {
                setVoidTarget(null);
                setMgrPin("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      <div className="print-only">
        <Receipt order={reprint} till={session?.till} />
      </div>
    </div>
  );
};

export default Today;
