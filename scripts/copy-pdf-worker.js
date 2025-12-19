// scripts/copy-pdf-worker.js
// Copies pdf.js workers from pdfjs-dist into /public.
// - For pdfjs-dist v4+, the worker is usually an ES module (.mjs)
// - We copy BOTH .mjs and .js when available for max compatibility.

const fs = require("fs");
const path = require("path");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyIfExists(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[pdfjs] Copied worker -> ${dest}`);
    console.log(`[pdfjs] Source worker -> ${src}`);
    return true;
  }
  return false;
}

function main() {
  const root = process.cwd();
  const publicDir = path.join(root, "public");
  ensureDir(publicDir);

  // ES module worker candidates (pdfjs-dist v4+)
  const mjsCandidates = [
    path.join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs"),
    path.join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.mjs"),
  ];

  // Classic worker candidates (legacy / older builds)
  const jsCandidates = [
    path.join(root, "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.min.js"),
    path.join(root, "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.js"),
    path.join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.js"),
    path.join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.js"),
  ];

  let copiedAny = false;

  // Prefer copying module worker (what your runtime error is asking for)
  for (const src of mjsCandidates) {
    const dest = path.join(publicDir, "pdf.worker.min.mjs");
    if (copyIfExists(src, dest)) {
      copiedAny = true;
      break;
    }
  }

  // Also copy a classic worker if present (nice fallback)
  for (const src of jsCandidates) {
    const dest = path.join(publicDir, "pdf.worker.min.js");
    if (copyIfExists(src, dest)) {
      copiedAny = true;
      break;
    }
  }

  if (!copiedAny) {
    throw new Error(
      "[pdfjs] Could not find any pdf.worker file in pdfjs-dist. " +
        "Check node_modules/pdfjs-dist/**/pdf.worker* and your installed version."
    );
  }
}

main();
