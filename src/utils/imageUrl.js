export const resolveImageUrl = (path) => {
  if (!path) return "";
  const value = String(path).trim();
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }
  const base = import.meta.env.VITE_IMAGE_URL || "";
  if (!base) return value;
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = value.startsWith("/") ? value.slice(1) : value;
  return `${normalizedBase}/${normalizedPath}`;
};
