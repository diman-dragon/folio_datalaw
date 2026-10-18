// User-facing strings built from JS (static HTML text lives in index.html). Russian only for now.
const RU = {
  'err.notauri': 'Запущено без Tauri: файлы открываются только в приложении',
  'err.missing': 'Файл не найден: возможно, его переместили или удалили',
  'err.invalid': 'Это не PDF или файл повреждён',
  'err.large': 'Файл слишком большой',
  'err.open': 'Не удалось открыть файл',
  'home.remove': 'Убрать из библиотеки',
  'home.removed': 'Убрано из библиотеки (файл на диске не тронут)',
  'lib.imported': 'Добавлено',
  'lib.failed': 'не удалось',
  'edit.hintMark': 'Проведите мышью по тексту',
  'edit.noText': 'На странице нет текстового слоя (скан): выделять нечего',
  'viewer.copied': 'Скопировано',
  'annot.nosave': 'Не удалось сохранить пометки: закончилось место в хранилище',
  'pw.ask': 'Документ защищён паролем',
  'pw.wrong': 'Неверный пароль, попробуйте ещё раз',
};
export const t = (key) => RU[key] ?? key;
