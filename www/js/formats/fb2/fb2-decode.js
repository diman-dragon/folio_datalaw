// Bytes of an FB2 file -> text: honours a BOM and the encoding named in the XML declaration (windows-1251 is common).
export function decodeXml(bytes) {
  let label = 'utf-8', skip = 0;
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) skip = 3;
  else if (bytes[0] === 0xff && bytes[1] === 0xfe) label = 'utf-16le';
  else if (bytes[0] === 0xfe && bytes[1] === 0xff) label = 'utf-16be';
  else {
    const head = new TextDecoder('latin1').decode(bytes.subarray(0, 200));
    const m = /encoding=["']([\w.-]+)["']/i.exec(head);
    if (m) label = m[1].toLowerCase();
  }
  let dec;
  try { dec = new TextDecoder(label); } catch { dec = new TextDecoder('utf-8'); }
  return dec.decode(bytes.subarray(skip));
}
