// The ONLY file that touches window.__TAURI__ (withGlobalTauri); everything else goes through here.
const T = () => window.__TAURI__;
export const isTauri = () => !!T()?.core?.invoke;
export const invoke = (cmd, args) => T().core.invoke(cmd, args);
export const listen = (name, cb) => T().event.listen(name, cb);
export const openDialog = (opts) => T().dialog.open(opts);
