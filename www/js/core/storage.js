// Prefixed localStorage wrapper that never throws.
const P = 'folio.';
export const store = {
  get(k) { try { return localStorage.getItem(P + k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(P + k, v); } catch { /* quota or disabled: ignore */ } },
  del(k) { try { localStorage.removeItem(P + k); } catch { /* ignore */ } },
};
