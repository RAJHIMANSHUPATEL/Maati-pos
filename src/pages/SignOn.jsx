import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { posApi } from "../api/client";
import { useTill } from "../context/TillContext";
import PinPad from "../components/PinPad";
import { BRAND } from "../brand";

const SignOn = () => {
  const navigate = useNavigate();
  const { session, unlock } = useTill();
  const [step, setStep] = useState("code");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);

  if (!session?.token) {
    return <Navigate to="/" replace />;
  }
  if (session?.cashier) {
    return <Navigate to="/sell" replace />;
  }

  const submit = async (nextPin = pin, staffCode = code) => {
    if (staffCode.length < 4 || nextPin.length < 4 || busy) return;
    setBusy(true);
    try {
      const res = await posApi.signon(staffCode, nextPin);
      unlock({
        token: res.token,
        till: {
          posConfigId: res.data.posConfigId,
          posName: res.data.posName,
          surcharge: res.data.surcharge,
          store: res.data.store,
        },
        cashier: res.data.cashier,
      });
      navigate("/sell");
    } catch (error) {
      toast.error(error.message || "Wrong operator or PIN");
      setPin("");
      setStep("code");
      setCode("");
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
            Cashier sign-on
          </p>
          <p className="mt-2 truncate text-xs text-white/80">
            {session?.till?.posName} · {session?.till?.store?.name}
          </p>
        </div>
        <div className="bg-panel p-5">
          {step === "code" ? (
            <>
              <p className="text-center text-xs font-extrabold uppercase tracking-wider text-ink/60">
                Operator number
              </p>
              <p className="mt-2 text-center font-mono text-2xl font-bold tracking-[0.4em]">
                {code.padEnd(4, "·")}
              </p>
              <div className="mt-3">
                <PinPad
                  value={code}
                  onChange={setCode}
                  onComplete={(next) => {
                    setCode(next);
                    setStep("pin");
                  }}
                  disabled={busy}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-center text-xs font-extrabold uppercase tracking-wider text-ink/60">
                PIN for {code}
              </p>
              <div className="mt-3">
                <PinPad
                  value={pin}
                  onChange={setPin}
                  onComplete={(next) => submit(next, code)}
                  disabled={busy}
                />
              </div>
              <button
                type="button"
                className="mt-3 w-full text-center text-xs font-bold uppercase tracking-wider text-ink/60"
                onClick={() => {
                  setStep("code");
                  setCode("");
                  setPin("");
                }}
              >
                Change operator
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignOn;
