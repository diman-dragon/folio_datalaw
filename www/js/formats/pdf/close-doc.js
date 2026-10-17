// Releases a pdf.js document (worker memory) - in pdf.js the loading task owns the document.
export const closePdf = (pdf) => pdf.loadingTask.destroy();
