// "Reading now" rule: documents that were started (past page 1) and are not finished.
export const isReading = (d) => (d.lastPage ?? 1) > 1 && !(d.pages > 0 && d.lastPage >= d.pages);
