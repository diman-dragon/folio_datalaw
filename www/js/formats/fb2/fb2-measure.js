// Text width through a canvas context (the browser's own font metrics), cached per font and string.
export function createMeasure() {
  let ctx = null;
  const cache = new Map();
  return (text, font) => {
    const key = `${font}|${text}`;
    let w = cache.get(key);
    if (w === undefined) {
      ctx ??= document.createElement('canvas').getContext('2d');
      ctx.font = font;
      w = ctx.measureText(text).width;
      cache.set(key, w);
    }
    return w;
  };
}
