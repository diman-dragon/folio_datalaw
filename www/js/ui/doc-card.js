// One library card: cover (or placeholder), name, size and reading progress.
import { icon } from './icon.js';
import { t } from '../core/strings.js';
import { fmtSize, stripDocExt, progress } from '../core/format.js';
import { getCover } from '../data/covers.js';
const hue = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
export function docCard(d) {
  const li = document.createElement('li');
  li.className = 'doc';
  li.dataset.id = d.id;
  li.title = d.path;
  li.style.setProperty('--hue', hue(d.name));
  li.innerHTML = '<button class="doc-main"><div class="cover"><div class="cover-ph"></div><img alt="" hidden><i class="prog"></i></div>'
    + '<div class="doc-info"><div class="doc-name"></div><div class="small muted doc-meta"></div></div></button><button class="doc-del"></button>';
  li.querySelector('.cover-ph').innerHTML = `${icon('file', 26)}<b>${d.kind === 'fb2' ? 'FB2' : 'PDF'}</b>`;
  li.querySelector('.prog').style.width = progress(d.lastPage, d.pages) + '%';
  li.querySelector('.doc-name').textContent = d.title || stripDocExt(d.name);
  const pos = d.pages ? `${d.lastPage ?? 1}/${d.pages}` : '';
  li.querySelector('.doc-meta').textContent = [fmtSize(d.size), pos].filter(Boolean).join(' · ');
  const del = li.querySelector('.doc-del');
  del.innerHTML = icon('trash', 18);
  del.title = t('home.remove');
  const url = getCover(d.id);
  if (url) {
    const img = li.querySelector('img');
    img.src = url;
    img.hidden = false;
    li.querySelector('.cover-ph').hidden = true;
  }
  return li;
}
