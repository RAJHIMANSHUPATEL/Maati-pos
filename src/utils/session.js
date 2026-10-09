const KEY = "maatiPosSession";

export const getSession = () => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setSession = (data) => {
  sessionStorage.setItem(KEY, JSON.stringify(data));
};

export const clearSession = () => {
  sessionStorage.removeItem(KEY);
};
