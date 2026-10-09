import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { TillProvider, useTill } from "./context/TillContext";
import { BagProvider } from "./context/BagContext";
import TillLayout from "./components/TillLayout";
import Lock from "./pages/Lock.jsx";
import SignOn from "./pages/SignOn.jsx";
import Sell from "./pages/Sell.jsx";
import Pay from "./pages/Pay.jsx";
import Today from "./pages/Today.jsx";

const Guard = () => {
  const { session } = useTill();
  if (!session?.token) return <Navigate to="/" replace />;
  return <Outlet />;
};

const CashierGuard = () => {
  const { session } = useTill();
  if (!session?.cashier) return <Navigate to="/signon" replace />;
  return <Outlet />;
};

function App() {
  return (
    <TillProvider>
      <BagProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Lock />} />
            <Route element={<Guard />}>
              <Route path="/signon" element={<SignOn />} />
              <Route element={<CashierGuard />}>
                <Route element={<TillLayout />}>
                  <Route path="/sell" element={<Sell />} />
                  <Route path="/pay" element={<Pay />} />
                  <Route path="/today" element={<Today />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </BagProvider>
    </TillProvider>
  );
}

export default App;
