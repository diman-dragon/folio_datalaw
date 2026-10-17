// Tiny event bus for decoupled modules (on / emit).
const handlers = new Map();
export function on(name, fn) {
  if (!handlers.has(name)) handlers.set(name, new Set());
  handlers.get(name).add(fn);
  return () => handlers.get(name)?.delete(fn);
}
export const emit = (name, payload) => handlers.get(name)?.forEach((fn) => fn(payload));
