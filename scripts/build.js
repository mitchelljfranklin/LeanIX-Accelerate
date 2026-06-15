/*
 * Build script — creates store-ready zip files for Chrome, Edge, and Firefox.
 *
 * Output: dist/leanix-extension-chrome.zip
 *         dist/leanix-extension-edge.zip
 *         dist/leanix-extension-firefox.zip
 *
 * The Firefox build adds browser_specific_settings to the manifest.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const PACKAGE = require(path.join(ROOT, "package.json"));
const VERSION = PACKAGE.version;

/* Directories and files to include in each extension zip. */
const INCLUDE = [
  "manifest.json",
  "icons",
  "src",
];

/* System junk to exclude from zips. */
const EXCLUDE = [".DS_Store", "Thumbs.db"];

/* ------------------------------------------------------------------ */

function shouldInclude(filePath) {
  const rel = path.relative(ROOT, filePath);
  for (const name of EXCLUDE) {
    if (rel.includes(name)) return false;
  }
  return true;
}

function copyTree(zipDir, sourceDir) {
  if (!fs.existsSync(zipDir)) fs.mkdirSync(zipDir, { recursive: true });

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(zipDir, path.relative(ROOT, srcPath));

    if (!shouldInclude(srcPath)) continue;

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyTree(destPath, srcPath);
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, fs.readFileSync(srcPath));
    }
  }
}

function prepareStaging(label) {
  const stage = path.join(DIST, `leanix-extension-${label}`);
  if (fs.existsSync(stage)) fs.rmSync(stage, { recursive: true });
  fs.mkdirSync(stage, { recursive: true });

  for (const inc of INCLUDE) {
    const src = path.join(ROOT, inc);
    if (!fs.existsSync(src)) {
      console.warn(`  Skipping missing: ${inc}`);
      continue;
    }
    if (fs.statSync(src).isDirectory()) {
      copyTree(stage, src);
    } else {
      fs.mkdirSync(stage, { recursive: true });
      fs.writeFileSync(path.join(stage, inc), fs.readFileSync(src));
    }
  }

  return stage;
}

function createZip(stageDir, zipName) {
  const zipPath = path.join(DIST, zipName);
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  const stageName = path.basename(stageDir);

  try {
    execSync(`cd "${DIST}" && zip -r "${zipPath}" "${stageName}" -x "*.DS_Store"`, {
      stdio: "pipe",
    });
    const sizeKB = (fs.statSync(zipPath).size / 1024).toFixed(0);
    console.log(`  ${zipName}  (${sizeKB} KB)`);
  } catch (err) {
    console.error(`  Failed to create ${zipName}: ${err.message}`);
    console.log(`  Try: cd dist && zip -r ${zipName} ${stageName}`);
  }

  fs.rmSync(stageDir, { recursive: true });
}

/* ------------------------------------------------------------------ */

console.log(`\nBuilding LeanIX Extension v${VERSION}\n`);

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST);

/* ---- Chrome ----------------------------------------------------- */

console.log("Chrome:");
const chromeStage = prepareStaging("chrome");
createZip(chromeStage, "leanix-extension-chrome.zip");

/* ---- Edge (identical to Chrome) --------------------------------- */

console.log("Edge:");
const edgeStage = prepareStaging("edge");
createZip(edgeStage, "leanix-extension-edge.zip");

/* ---- Firefox ---------------------------------------------------- */

console.log("Firefox:");
const ffStage = prepareStaging("firefox");

const manifestPath = path.join(ffStage, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

manifest.browser_specific_settings = {
  gecko: {
    id: "leanix-extension@example.com",
    strict_min_version: "128.0",
  },
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("  Added browser_specific_settings.gecko");

createZip(ffStage, "leanix-extension-firefox.zip");

/* ---- Done ------------------------------------------------------- */

console.log("\nBuild complete — dist/ contains:");
const files = fs.readdirSync(DIST).filter((f) => f.endsWith(".zip"));
for (const f of files) {
  console.log(`  ${f}`);
}
console.log();
