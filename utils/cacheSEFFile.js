const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { setTempJSONPath } = require("../state/allVeriables");

const xsltDirectory = "./xslt/";
const tempDirectory = path.join(xsltDirectory, "temp");

// Caching SEF files to reuse
const sefFileCache = {};
const sefFileCache2 = {};
// Track in-flight compilations to avoid parallel writes to the same SEF
const sefFilePromises = {};

// Utility function to run shell commands asynchronously
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`ERROR: XSLT Processing Failed: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

function ensureTempDir() {
  if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory, { recursive: true });
  }
}

function pickTempSefFile(xslt) {
  const base = path.basename(xslt, ".xsl");
  const unique = `${process.pid}_${Date.now()}_${Math.random()
    .toString(16)
    .slice(2)}`;
  return path.join(tempDirectory, `tmp_${base}_${unique}.sef.json`);
}

async function compileSEF(xslt) {
  if (sefFilePromises[xslt]) {
    return sefFilePromises[xslt];
  }

  sefFilePromises[xslt] = (async () => {
    ensureTempDir();

    const sefFile = path.join(
      tempDirectory,
      `test_${path.basename(xslt, ".xsl")}.sef.json`
    );
    const xsltNormalizedPath = path.normalize(
      path.join(xsltDirectory, path.basename(xslt))
    );
    const sefNormalizedPath = path.normalize(sefFile);

    if (!fs.existsSync(xsltNormalizedPath)) {
      console.error(`ERROR: XSLT file not found: ${xsltNormalizedPath}`);
      return;
    }

    console.log(`Processing: ${xsltNormalizedPath} -> ${sefNormalizedPath}`);

    const tmpFile = path.normalize(pickTempSefFile(xslt));
    try {
      await execCommand(
        `xslt3 -t -xsl:"${xsltNormalizedPath}" -export:"${tmpFile}" -nogo`
      );

      // Replace target atomically (best-effort on Windows)
      if (fs.existsSync(sefNormalizedPath)) {
        fs.unlinkSync(sefNormalizedPath);
      }
      fs.renameSync(tmpFile, sefNormalizedPath);
      console.log(`Success: ${sefNormalizedPath}`);
      return sefFile;
    } catch (error) {
      console.error(error);
    } finally {
      if (fs.existsSync(tmpFile)) {
        try {
          fs.unlinkSync(tmpFile);
        } catch (cleanupError) {
          console.error(`ERROR: Deleting temp file failed: ${tmpFile}`, cleanupError);
        }
      }
    }
  })();

  try {
    return await sefFilePromises[xslt];
  } finally {
    delete sefFilePromises[xslt];
  }
}

// Function to clear the temp folder and cache
function clearTempData() {
  if (fs.existsSync(tempDirectory)) {
    fs.readdirSync(tempDirectory).forEach((file) => {
      const filePath = path.join(tempDirectory, file);
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`ERROR: Deleting file: ${filePath}`, err);
      }
    });
    console.log("Temp folder cleared.");
  }

  // Clear cache objects
  Object.keys(sefFileCache).forEach((key) => delete sefFileCache[key]);
  Object.keys(sefFileCache2).forEach((key) => delete sefFileCache2[key]);

  console.log("SEF file cache cleared.");
}

// Async function to cache SEF file
async function cacheSEFFile(xslt, userId) {
  if (!sefFileCache[xslt]) {
    const sefFile = await compileSEF(xslt);
    if (sefFile) {
      sefFileCache[xslt] = sefFile;
    }
  }

  setTempJSONPath(userId, sefFileCache);
  return sefFileCache[xslt];
}

// Async function to cache SEF file (for second sequence)
async function cacheSEFFile2(xslt, userId) {
  if (!sefFileCache2[xslt]) {
    const sefFile = await compileSEF(xslt);
    if (sefFile) {
      sefFileCache2[xslt] = sefFile;
    }
  }

  return sefFileCache2[xslt];
}

module.exports = { cacheSEFFile, cacheSEFFile2, clearTempData };
