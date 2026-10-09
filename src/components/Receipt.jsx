import { formatMoney } from "../utils/money";
import { isWeightedUnit, unitLabel } from "../utils/units";
import { BRAND } from "../brand";

export const parseReceiptItems = (raw) => {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const dash = (len = 32) => "─".repeat(len);

const Receipt = ({ order, till }) => {
  if (!order) return null;
  const items = parseReceiptItems(order.product_details);
  const store = till?.store || {};
  const created = order.createdAt ? new Date(order.createdAt) : new Date();
  const date = created.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = created.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const itemCount = items.reduce(
    (sum, item) => sum + (isWeightedUnit(item.unit) ? 1 : Number(item.quantity || 1)),
    0
  );
  const cityLine = [store.city, store.pin].filter(Boolean).join(" - ");
  const phone = store.mobile ? `Ph: ${store.mobile}` : "";

  return (
    <div
      id="pos-receipt"
      className="mx-auto w-[70mm] bg-white px-2 py-3 font-mono text-[11px] leading-snug text-black"
    >
      <p className="text-center text-lg font-bold tracking-[0.28em]">{BRAND.name.toUpperCase()}</p>
      <p className="text-center text-[10px] font-semibold tracking-[0.2em]">TAX INVOICE</p>
      <p className="mt-1 text-center font-bold">{store.name || order.store_name}</p>
      {store.address ? <p className="text-center">{store.address}</p> : null}
      {cityLine ? <p className="text-center">{cityLine}</p> : null}
      {phone ? <p className="text-center">{phone}</p> : null}
      {store.abn ? <p className="text-center">Reg. no: {store.abn}</p> : null}
      <p className="my-1 text-center">{dash()}</p>
      <div className="grid grid-cols-[5.2rem_1fr] gap-x-1">
        <span>Inv No</span>
        <span className="font-bold">{order.order_number}</span>
        <span>Date</span>
        <span>{date}</span>
        <span>Time</span>
        <span>{time}</span>
        <span>Till</span>
        <span>{till?.posName || "POS"}</span>
        <span>Cashier</span>
        <span>{order.cashier_name || till?.cashierName || "—"}</span>
        <span>Pay</span>
        <span>CASH</span>
      </div>
      <p className="my-1 text-center">{dash()}</p>
      <div className="grid grid-cols-[1fr_2.4rem_3.4rem] font-bold">
        <span>Item</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Amt</span>
      </div>
      <p className="text-center">{dash()}</p>
      {items.map((item, idx) => {
        const weighted = isWeightedUnit(item.unit);
        const qty = weighted ? Number(item.weight || 0) : Number(item.quantity || 1);
        const qtyLabel = weighted
          ? `${qty.toFixed(3)}${unitLabel(item.unit)}`
          : `${qty}${unitLabel(item.unit)}`;
        const rate = Number(item.price || 0);
        const amt = Number(item.line_total ?? rate * qty);
        return (
          <div key={idx} className="mb-1">
            <p className="font-bold">{item.name}</p>
            <div className="grid grid-cols-[1fr_2.4rem_3.4rem]">
              <span>
                {qtyLabel} x {rate.toFixed(2)}
              </span>
              <span className="text-right">{weighted ? qty.toFixed(3) : qty}</span>
              <span className="text-right">{amt.toFixed(2)}</span>
            </div>
          </div>
        );
      })}
      <p className="text-center">{dash()}</p>
      <div className="flex justify-between">
        <span>Items</span>
        <span>{itemCount}</span>
      </div>
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{Number(order.sub_total || 0).toFixed(2)}</span>
      </div>
      {Number(order.surcharge) > 0 ? (
        <div className="flex justify-between">
          <span>Surcharge</span>
          <span>{Number(order.surcharge).toFixed(2)}</span>
        </div>
      ) : null}
      <p className="my-1 text-center font-bold">════════════════</p>
      <div className="flex justify-between text-sm font-bold">
        <span>TOTAL</span>
        <span>{formatMoney(order.grand_total)}</span>
      </div>
      <p className="my-1 text-center font-bold">════════════════</p>
      <div className="flex justify-between">
        <span>Cash</span>
        <span>{formatMoney(order.tender_amount)}</span>
      </div>
      <div className="flex justify-between font-bold">
        <span>Change</span>
        <span>{formatMoney(order.change_amount)}</span>
      </div>
      {order.notes ? <p className="mt-2">Note: {order.notes}</p> : null}
      <p className="mt-3 text-center">{dash()}</p>
      <p className="text-center font-bold">Thank you for shopping</p>
      <p className="text-center">at {store.name || BRAND.name}</p>
      <p className="mt-2 text-center text-[9px]">
        Goods once sold can be voided the same day at this till only.
      </p>
      <p className="mt-2 text-center tracking-[0.35em]">***</p>
    </div>
  );
};

export default Receipt;
