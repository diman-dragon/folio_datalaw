// Library screen rendering: "Reading now" and "Others" sections; only readable files are shown, the rest are counted.
import { listDocs } from '../data/library.js';
import { splitReadable } from '../app/library-health.js';
import { isReading } from '../app/reading.js';
import { docCard } from './doc-card.js';
import { t } from '../core/strings.js';
import { on } from '../core/bus.js';
const $ = (id) => document.getElementById(id);
let seq = 0, hiddenDocs = [];
export const getHiddenDocs = () => hiddenDocs;
function fill(section, list, count, docs) {
  list.replaceChildren(...docs.map(docCard));
  count.textContent = docs.length ? String(docs.length) : '';
  section.hidden = docs.length === 0;
}
async function refresh() {
  const mine = ++seq;
  const { ok, hidden } = await splitReadable(listDocs());
  if (mine !== seq) return; // a newer refresh is on its way
  hiddenDocs = hidden;
  fill($('sec-reading'), $('reading-list'), $('cnt-reading'), ok.filter(isReading));
  fill($('sec-rest'), $('doc-list'), $('cnt-rest'), ok.filter((d) => !isReading(d)));
  $('doc-empty').hidden = ok.length > 0 || hidden.length > 0;
  $('doc-hidden').hidden = hidden.length === 0;
  $('hidden-text').textContent = `${t('home.hidden')}: ${hidden.length}`;
}
on('libchange', refresh);
window.addEventListener('focus', refresh); // files may appear / vanish while the app was in the background
refresh();
