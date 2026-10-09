import { NavLink, Outlet, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useBag } from "../context/BagContext";
import { useTill } from "../context/TillContext";
import { posApi } from "../api/client";
import Clock from "./Clock";
import { BRAND } from "../brand";

const TillLayout = () => {
  const navigate = useNavigate();
  const { session, unlock, lock } = useTill();
  const { clear } = useBag();

  const onLock = () => {
    clear();
    lock();
    navigate("/");
  };

  const onSignOff = async () => {
    try {
      const res = await posApi.signoff();
      clear();
      unlock({ token: res.token, till: res.data, cashier: null });
      navigate("/signon");
    } catch (error) {
      toast.error(error.message || "Could not sign off");
    }
  };

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-desk">
      <header className="flex items-center gap-4 bg-chrome px-3 py-1.5 text-white print:hidden">
        <p className="text-lg font-extrabold tracking-[0.18em]">{BRAND.name.toUpperCase()} POS</p>
        <div className="min-w-0 text-xs">
          <p className="truncate font-bold">{session?.till?.store?.name}</p>
          <p className="truncate text-white/75">
            {session?.till?.posName} · {session?.cashier?.name || "SIGN ON"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Clock />
          <NavLink
            to="/sell"
            className={({ isActive }) =>
              `pos-fkey !min-h-9 h-9 px-3 ${isActive ? "bg-pay text-ink" : "bg-chrome-2 text-white"}`
            }
          >
            Register
          </NavLink>
          <NavLink
            to="/today"
            className={({ isActive }) =>
              `pos-fkey !min-h-9 h-9 px-3 ${isActive ? "bg-pay text-ink" : "bg-chrome-2 text-white"}`
            }
          >
            Journal
          </NavLink>
          <button type="button" onClick={onSignOff} className="pos-fkey !min-h-9 h-9 bg-chrome-2 px-3 text-white">
            Sign off
          </button>
          <button type="button" onClick={onLock} className="pos-fkey !min-h-9 h-9 bg-void px-3 text-white">
            Lock
          </button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default TillLayout;
