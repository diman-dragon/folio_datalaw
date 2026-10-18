// The document currently shown by the viewer ({ pdf, list, meta }) for UI modules that need it.
let cur = null;
export const setActive = (a) => { cur = a; };
export const getActive = () => cur;
