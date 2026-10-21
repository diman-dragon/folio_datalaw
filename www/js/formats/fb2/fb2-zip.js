// Minimal ZIP reader for .fb2.zip: finds the first .fb2 entry and inflates it (stored or deflate) - no library needed.
const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
export const isZip = (b) => b.length > 3 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 3 && b[3] === 4;
async function inflate(data) {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
export async function unzipFb2(bytes) {
  let e = bytes.length - 22;
  while (e >= 0 && u32(bytes, e) !== 0x06054b50) e--;
  if (e < 0) throw new Error('zip: no central directory');
  const count = u16(bytes, e + 10);
  let p = u32(bytes, e + 16);
  for (let n = 0; n < count && u32(bytes, p) === 0x02014b50; n++) {
    const method = u16(bytes, p + 10), size = u32(bytes, p + 20), nlen = u16(bytes, p + 28);
    const xlen = u16(bytes, p + 30), clen = u16(bytes, p + 32), off = u32(bytes, p + 42);
    const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nlen));
    if (/\.fb2$/i.test(name)) {
      const start = off + 30 + u16(bytes, off + 26) + u16(bytes, off + 28);
      const data = bytes.subarray(start, start + size);
      if (method === 0) return data;
      if (method === 8) return inflate(data);
      throw new Error(`zip: unsupported method ${method}`);
    }
    p += 46 + nlen + xlen + clen;
  }
  throw new Error('zip: no .fb2 inside');
}
