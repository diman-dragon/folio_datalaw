// Browser services the FB2 engine needs: canvas text metrics, image decoding and the XML parser.
import { createMeasure } from './fb2-measure.js';
import { decodeImage } from './fb2-image.js';
export const fb2Deps = () => ({
  measure: createMeasure(),
  decodeImage,
  parseXml: (text) => new DOMParser().parseFromString(text, 'application/xml'),
});
