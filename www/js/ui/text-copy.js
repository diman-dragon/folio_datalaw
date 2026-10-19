// Copies the current text selection to the clipboard and confirms with a toast.
import { selectedText, getSel } from './text-select.js';
import { copyText } from './clipboard.js';
import { toast } from './toast.js';
import { t } from '../core/strings.js';
export async function copySelection() {
  if (getSel() && (await copyText(selectedText()))) toast(t('viewer.copied'));
}
