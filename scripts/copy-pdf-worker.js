// scripts/copy-pdf-worker.js
const fs = require("fs");
const path = require("path");

function copyFileSyncSafe(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`[pdfjs] Copied worker -> ${dest}`);
}

function main() {
  const projectRoot = process.cwd();

  // pdfjs-dist v3 worker location:
  const workerSrc = path.join(
    projectRoot,
    "node_modules",
    "pdfjs-dist",
    "build",
    "pdf.worker.min.js"
  );

  const workerDest = path.join(projectRoot, "public", "pdf.worker.min.js");

  if (!fs.existsSync(workerSrc)) {
    console.warn("[pdfjs] Worker not found at:", workerSrc);
    process.exit(0);
  }

  copyFileSyncSafe(workerSrc, workerDest);
}

main();
