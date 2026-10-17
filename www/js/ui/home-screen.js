// Library screen: grid of cards; click opens, trash button / right click removes from the library.
import { listDocs } from '../data/library.js';
import { removeEntry } from '../app/remove-entry.js';
import { openStored } from '../app/open-stored.js';
import { docCard } from './doc-card.js';
import { on } from '../core/bus.js';
const list = document.getElementById('doc-list');
const empty = document.getElementById('doc-empty');
function refresh() {
  const docs = listDocs();
  list.replaceChildren(...docs.map(docCard));
  empty.hidden = docs.length > 0;
}
list.addEventListener('click', (e) => {
  const li = e.target.closest('.doc');
  if (!li) return;
  if (e.target.closest('.doc-del')) removeEntry(li.dataset.id);
  else openStored(li.dataset.id);
});
list.addEventListener('contextmenu', (e) => {
  const li = e.target.closest('.doc');
  if (!li) return;
  e.preventDefault();
  removeEntry(li.dataset.id);
});
on('libchange', refresh);
refresh();
