// Finds createWorker in the loaded tesseract module: the vendored ESM build exposes it only on `default`.
export function createWorkerOf(mod) {
  const fn = mod?.createWorker ?? mod?.default?.createWorker;
  if (typeof fn !== 'function') throw new Error('tesseract module has no createWorker');
  return fn;
}
