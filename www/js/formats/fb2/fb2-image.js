// Decodes an image embedded in an FB2 file (base64 in <binary>) into a bitmap with its natural size.
export async function decodeImage(type, b64) {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const bitmap = await createImageBitmap(new Blob([bytes], { type }));
  return { bitmap, w: bitmap.width, h: bitmap.height };
}
