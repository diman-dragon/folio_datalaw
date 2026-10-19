// Holder of the viewer's current session (the open document with everything wired to it), or null.
let session = null;
export const getSession = () => session;
export const setSession = (s) => { session = s; };
