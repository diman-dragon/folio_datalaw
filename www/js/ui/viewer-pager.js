// Page counter of the viewer: number box, total, prev / next buttons and the reading-progress line under the header.
const $ = (id) => document.getElementById(id);
export function bindPager({ total, goTo }) {
  const input = $('page-input');
  $('page-total').textContent = '/ ' + total;
  input.max = total;
  input.onchange = () => goTo(Number(input.value));
  input.onfocus = () => input.select();
  input.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') input.blur(); };
  $('page-prev').onclick = () => goTo(Number(input.value) - 1);
  $('page-next').onclick = () => goTo(Number(input.value) + 1);
  return {
    show: (p) => {
      input.value = p;
      const pct = total > 0 ? Math.round((p / total) * 100) : 0;
      $('read-fill').style.width = `${pct}%`;
      $('read-progress').setAttribute('aria-valuenow', String(pct));
    },
  };
}
