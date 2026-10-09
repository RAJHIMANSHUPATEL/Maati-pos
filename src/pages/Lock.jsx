import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { posApi } from "../api/client";
import { useTill } from "../context/TillContext";
import PinPad from "../components/PinPad";
import { BRAND } from "../brand";

const Lock = () => {
  const navigate = useNavigate();
  const { session, unlock } = useTill();
  const [tills, setTills] = useState([]);
  const [posId, setPosId] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    posApi
      .tills()
      .then((res) => {
        if (!alive) return;
        const list = res.data || [];
        setTills(list);
        setPosId((current) => current || list[0]?._id || "");
      })
      .catch(() => {
        if (alive) toast.error("Could not load tills");
      });
    return () => {
      alive = false;
    };
  }, []);

  if (session?.token && session?.cashier) {
    return <Navigate to="/sell" replace />;
  }
  if (session?.token) {
    return <Navigate to="/signon" replace />;
  }

  const submit = async (nextPin = pin) => {
    if (!posId || nextPin.length < 4 || busy) return;
    setBusy(true);
    try {
      const res = await posApi.unlock(posId, nextPin);
      unlock({ token: res.token, till: res.data, cashier: null });
      navigate("/signon");
    } catch (error) {
      toast.error(error.message || "Wrong PIN");
      setPin("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-chrome-2 px-4 py-10">
      <div className="w-full max-w-sm border border-black/40 bg-chrome shadow-2xl">
        <div className="border-b border-white/10 px-5 py-4 text-center text-white">
          <p className="text-2xl font-extrabold tracking-[0.28em]">{BRAND.name.toUpperCase()} POS</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
            Unlock register
          </p>
        </div>
        <div className="bg-panel p-5">
          <label className="block text-xs font-extrabold uppercase tracking-wider">
            Register
            <select
              value={posId}
              onChange={(e) => setPosId(e.target.value)}
              className="mt-1 w-full border border-key-edge bg-white px-3 py-2 font-semibold"
            >
              {tills.map((till) => (
                <option key={till._id} value={till._id}>
                  {till.pos_name} — {till.store?.name || till.store?.city}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-4 text-center text-xs font-extrabold uppercase tracking-wider text-ink/60">
            Enter 4-digit PIN
          </p>
          <div className="mt-3">
            <PinPad value={pin} onChange={setPin} onComplete={submit} disabled={busy} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lock;
