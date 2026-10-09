import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { posApi } from "../api/client";
import { useBag } from "../context/BagContext";
import BagPanel from "../components/BagPanel";
import ProductTile from "../components/ProductTile";
import WeightSheet from "../components/WeightSheet";
import { isWeightedUnit } from "../utils/units";

const looksLikeBarcode = (value) => /^\d{8,}$/.test(String(value).trim());

const Sell = () => {
  const searchRef = useRef(null);
  const { addPiece, addWeighted } = useBag();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [weightProduct, setWeightProduct] = useState(null);

  useEffect(() => {
    posApi
      .categories()
      .then((res) => setCategories(res.data || []))
      .catch((error) => toast.error(error.message || "Could not load categories"));
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (query.trim() && !looksLikeBarcode(query)) params.q = query.trim();
    posApi
      .products(params)
      .then((res) => {
        if (alive) setProducts(res.data || []);
      })
      .catch((error) => {
        if (alive) toast.error(error.message || "Could not load products");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [category, query]);

  const pickProduct = (product) => {
    if (!product?.stockStatus) {
      toast.error("Sold out");
      return;
    }
    if (isWeightedUnit(product.quantityUnit)) {
      setWeightProduct(product);
      return;
    }
    addPiece(product);
  };

  const scanBarcode = async (code) => {
    try {
      const res = await posApi.barcode(code);
      pickProduct(res.data);
      setQuery("");
    } catch (error) {
      toast.error(error.message || "No product for this barcode");
    }
    searchRef.current?.focus();
  };

  const onSearchKey = (e) => {
    if (e.key !== "Enter") return;
    const value = e.currentTarget.value.trim();
    if (looksLikeBarcode(value)) {
      e.preventDefault();
      scanBarcode(value);
    }
  };

  const chips = useMemo(
    () => [{ _id: "", name: "All" }, ...categories],
    [categories]
  );

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[32rem_minmax(0,1fr)]">
      <div className="min-h-0 overflow-hidden border-b border-black/30 lg:border-b-0 lg:border-r">
        <BagPanel />
      </div>
      <section className="flex min-h-0 flex-col bg-desk p-2">
        <label className="flex items-center gap-2 bg-chrome px-2 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-white">
          PLU / barcode
          <input
            ref={searchRef}
            value={query}
            autoFocus
            autoComplete="off"
            placeholder="Scan or type item, then Enter"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKey}
            className="h-10 flex-1 border border-black/40 bg-led px-3 font-mono text-lg text-led-fg outline-none placeholder:text-led-fg/35"
          />
        </label>
        <div className="mt-2 grid auto-cols-[minmax(6.5rem,1fr)] grid-flow-col gap-1 overflow-x-auto">
          {chips.map((chip) => (
            <button
              key={chip._id || "all"}
              type="button"
              onClick={() => setCategory(chip._id)}
              className={`pos-fkey px-2 ${
                category === chip._id ? "bg-pay text-ink" : "bg-chrome text-white"
              }`}
            >
              {chip.name}
            </button>
          ))}
        </div>
        <div className="mt-2 min-h-0 flex-1 overflow-y-auto bg-panel p-2">
          {loading ? (
            <p className="p-6 font-mono text-sm text-ink/60">LOADING PLU…</p>
          ) : products.length === 0 ? (
            <p className="p-6 font-mono text-sm text-ink/60">NO ITEMS</p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {products.map((product) => (
                <ProductTile key={product._id} product={product} onPick={pickProduct} />
              ))}
            </div>
          )}
        </div>
      </section>
      <WeightSheet
        product={weightProduct}
        open={Boolean(weightProduct)}
        onClose={() => setWeightProduct(null)}
        onAdd={(weight) => {
          addWeighted(weightProduct, weight);
          setWeightProduct(null);
        }}
      />
    </div>
  );
};

export default Sell;
