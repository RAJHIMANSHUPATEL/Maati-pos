import { createContext, useContext, useMemo, useState } from "react";
import { roundMoney } from "../utils/money";
import { isWeightedUnit } from "../utils/units";

const BagContext = createContext(null);

const lineTotal = (line) =>
  roundMoney(
    isWeightedUnit(line.quantityUnit)
      ? Number(line.posPrice) * Number(line.weight || 0)
      : Number(line.posPrice) * Number(line.quantity || 0)
  );

export const BagProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState("");

  const value = useMemo(() => {
    const addPiece = (product) => {
      if (!product?.stockStatus) return;
      setItems((prev) => {
        const existing = prev.find(
          (line) => line.product === product._id && !isWeightedUnit(line.quantityUnit)
        );
        if (existing) {
          return prev.map((line) =>
            line === existing ? { ...line, quantity: line.quantity + 1 } : line
          );
        }
        return [
          ...prev,
          {
            product: product._id,
            name: product.name,
            cover: product.cover,
            posPrice: Number(product.posPrice),
            quantityUnit: product.quantityUnit,
            quantity: 1,
            stockStatus: product.stockStatus,
          },
        ];
      });
    };

    const addWeighted = (product, weight) => {
      if (!product?.stockStatus) return;
      const kg = Number(weight);
      if (!(kg > 0)) return;
      setItems((prev) => {
        const existing = prev.find(
          (line) => line.product === product._id && isWeightedUnit(line.quantityUnit)
        );
        if (existing) {
          return prev.map((line) =>
            line === existing ? { ...line, weight: roundMoney(Number(line.weight) + kg) } : line
          );
        }
        return [
          ...prev,
          {
            product: product._id,
            name: product.name,
            cover: product.cover,
            posPrice: Number(product.posPrice),
            quantityUnit: product.quantityUnit,
            quantity: 1,
            weight: kg,
            stockStatus: product.stockStatus,
          },
        ];
      });
    };

    const setQty = (productId, quantity) => {
      const qty = Math.max(0, Math.round(Number(quantity) || 0));
      setItems((prev) =>
        prev
          .map((line) =>
            line.product === productId && !isWeightedUnit(line.quantityUnit)
              ? { ...line, quantity: qty }
              : line
          )
          .filter((line) => isWeightedUnit(line.quantityUnit) || line.quantity > 0)
      );
    };

    const setWeight = (productId, weight) => {
      const kg = Number(weight);
      setItems((prev) =>
        prev
          .map((line) =>
            line.product === productId && isWeightedUnit(line.quantityUnit)
              ? { ...line, weight: kg }
              : line
          )
          .filter((line) => !isWeightedUnit(line.quantityUnit) || Number(line.weight) > 0)
      );
    };

    const remove = (productId) => {
      setItems((prev) => prev.filter((line) => line.product !== productId));
    };

    const clear = () => {
      setItems([]);
      setNotes("");
    };

    const subTotal = roundMoney(items.reduce((sum, line) => sum + lineTotal(line), 0));

    return {
      items,
      notes,
      setNotes,
      addPiece,
      addWeighted,
      setQty,
      setWeight,
      remove,
      clear,
      subTotal,
      lineTotal,
      count: items.length,
    };
  }, [items, notes]);

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
};

export const useBag = () => {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag must be used within BagProvider");
  return ctx;
};
