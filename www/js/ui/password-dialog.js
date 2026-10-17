// Password prompt as a native <dialog> (window.prompt is not reliable in webviews).
import { t } from '../core/strings.js';
const dlg = document.getElementById('pw');
const input = document.getElementById('pw-input');
const msg = document.getElementById('pw-msg');
document.getElementById('pw-cancel').addEventListener('click', () => dlg.close(''));
export function askPassword(wrong = false) {
  return new Promise((resolve) => {
    msg.textContent = t(wrong ? 'pw.wrong' : 'pw.ask');
    input.value = '';
    dlg.returnValue = '';
    dlg.addEventListener('close', () => resolve(dlg.returnValue === 'ok' ? input.value : null), { once: true });
    dlg.showModal();
    input.focus();
  });
}
