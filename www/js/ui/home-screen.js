// Library screen: "Reading now" and "Others" sections; only readable files are shown (the rest are counted and can be cleaned).
import { listDocs } from '../data/library.js';
import { splitReadable } from '../app/library-health.js';
import { isReading } from '../app/reading.js';
import { removeEntry } from '../app/remove-entry.js';
import { openStored } from '../app/open-stored.js';
import { docCard } from './doc-card.js';
import { t } from '../core/strings.js';
import { on } from '../core/bus.js';
const $ = (id) => document.getElementById(id);
let seq = 0, hiddenDocs = [];
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
$('home-body').addEventListener('click', (e) => {
  const li = e.target.closest('.doc');
  if (!li) return;
  if (e.target.closest('.doc-del')) removeEntry(li.dataset.id);
  else openStored(li.dataset.id);
});
$('home-body').addEventListener('contextmenu', (e) => {
  const li = e.target.closest('.doc');
  if (!li) return;
  e.preventDefault();
  removeEntry(li.dataset.id);
});
$('hidden-clean').addEventListener('click', () => {
  hiddenDocs.forEach((d) => removeEntry(d.id, { quiet: true }));
});
on('libchange', refresh);
window.addEventListener('focus', refresh); // files may appear / vanish while the app was in the background
refresh();
