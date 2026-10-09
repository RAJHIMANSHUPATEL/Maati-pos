import { BRAND } from "../brand";

const Wordmark = ({ className = "" }) => (
  <span className={`font-serif italic tracking-tight text-ink ${className}`}>
    {BRAND.name}
  </span>
);

export default Wordmark;
