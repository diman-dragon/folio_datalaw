// Priority render queue: runs at most N jobs at once, always picking the job with the smallest priority value.
export function createQueue(concurrency = 2) {
  const pending = new Map();
  let active = 0;
  let scheduled = false;
  function pump() {
    scheduled = false;
    while (active < concurrency && pending.size) {
      let key = null;
      let best = Infinity;
      for (const [k, e] of pending) {
        const p = e.prio();
        if (key === null || p < best) { key = k; best = p; }
      }
      const { run } = pending.get(key);
      pending.delete(key);
      active++;
      Promise.resolve().then(run).catch(() => {}).finally(() => { active--; pump(); });
    }
  }
  const schedule = () => { if (!scheduled) { scheduled = true; queueMicrotask(pump); } };
  return {
    add(key, prio, run) { pending.set(key, { prio, run }); schedule(); },
    drop: (key) => pending.delete(key),
    clear: () => pending.clear(),
    size: () => pending.size,
  };
}
