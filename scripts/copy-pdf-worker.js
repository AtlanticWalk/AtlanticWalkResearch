// scripts/copy-pdf-worker.js
const fs = require("fs");
const path = require("path");

function resolveWorker() {
  const candidates = [
    "pdfjs-dist/build/pdf.worker.min.js",
    "pdfjs-dist/build/pdf.worker.js",
    "pdfjs-dist/legacy/build/pdf.worker.min.js",
    "pdfjs-dist/legacy/build/pdf.worker.js"
  ];

  for (const rel of candidates) {
    try {
      return require.resolve(rel);
    } catch (_) {}
  }

  throw new Error(
    "[pdfjs] Could not resolve a pdf.worker file from pdfjs-dist. Check installed version."
  );
}

(function main() {
  const workerSrc = resolveWorker();
  const publicDir = path.join(process.cwd(), "public");
  const outPath = path.join(publicDir, "pdf.worker.min.js");

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  fs.copyFileSync(workerSrc, outPath);
  console.log(`[pdfjs] Copied worker -> ${outPath}`);
})();
