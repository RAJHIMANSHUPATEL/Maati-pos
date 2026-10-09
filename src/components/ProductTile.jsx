import { formatMoney } from "../utils/money";
import { isWeightedUnit, unitLabel } from "../utils/units";

const ProductTile = ({ product, onPick }) => {
  const soldOut = !product.stockStatus;
  const weighted = isWeightedUnit(product.quantityUnit);

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => onPick(product)}
      className="pos-key flex min-h-[4.75rem] flex-col items-stretch justify-between p-2 text-left"
    >
      <span className="line-clamp-2 text-[0.8rem] leading-tight normal-case tracking-normal text-ink">
        {product.name}
      </span>
      <span className="mt-1 flex items-end justify-between gap-1">
        <span className="font-mono text-sm tabular-nums text-chrome">
          {formatMoney(product.posPrice)}
          <span className="text-[0.65rem] font-semibold text-ink/60">
            /{unitLabel(product.quantityUnit)}
          </span>
        </span>
        {soldOut ? (
          <span className="bg-void px-1 text-[0.6rem] font-extrabold text-white">OOS</span>
        ) : weighted ? (
          <span className="text-[0.6rem] font-extrabold text-ink/50">WT</span>
        ) : null}
      </span>
    </button>
  );
};

export default ProductTile;
