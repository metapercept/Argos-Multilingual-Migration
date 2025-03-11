const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { setTempJSONPath } = require("../state/allVeriables");

const xsltDirectory = "./xslt/";
const tempDirectory = path.join(xsltDirectory, "temp");

// Caching SEF files to reuse
const sefFileCache = {};
const sefFileCache2 = {};

// Utility function to run shell commands asynchronously
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { stdio: "inherit" }, (error, stdout, stderr) => {
      if (error) {
        reject(`❌ XSLT Processing Failed: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Function to clear the temp folder and cache
function clearTempData() {
  if (fs.existsSync(tempDirectory)) {
    fs.readdirSync(tempDirectory).forEach((file) => {
      const filePath = path.join(tempDirectory, file);
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`❌ Error deleting file: ${filePath}`, err);
      }
    });
    console.log("🧹 Temp folder cleared.");
  }

  // Clear cache objects
  Object.keys(sefFileCache).forEach((key) => delete sefFileCache[key]);
  Object.keys(sefFileCache2).forEach((key) => delete sefFileCache2[key]);

  console.log("🗑️ SEF file cache cleared.");
}

// Async function to cache SEF file
async function cacheSEFFile(xslt, userId) {
  if (!sefFileCache[xslt]) {
    const sefFile = path.join(
      tempDirectory,
      `test_${path.basename(xslt, ".xsl")}.sef.json`
    );
    const xsltNormalizedPath = path.normalize(
      path.join(xsltDirectory, path.basename(xslt))
    );
    const sefNormalizedPath = path.normalize(sefFile);

    if (!fs.existsSync(xsltNormalizedPath)) {
      console.error(`❌ ERROR: XSLT file not found: ${xsltNormalizedPath}`);
      return;
    }

    console.log(`🚀 Processing: ${xsltNormalizedPath} -> ${sefNormalizedPath}`);

    try {
      await execCommand(
        `xslt3 -t -xsl:"${xsltNormalizedPath}" -export:"${sefNormalizedPath}" -nogo`
      );
      console.log(`✅ Success: ${sefNormalizedPath}`);
      sefFileCache[xslt] = sefFile;
    } catch (error) {
      console.error(error);
    }
  }

  setTempJSONPath(userId, sefFileCache);
  return sefFileCache[xslt];
}

// Async function to cache SEF file (for second sequence)
async function cacheSEFFile2(xslt, userId) {
  if (!sefFileCache2[xslt]) {
    const sefFile = path.join(
      tempDirectory,
      `test_${path.basename(xslt, ".xsl")}.sef.json`
    );
    const xsltNormalizedPath = path.normalize(
      path.join(xsltDirectory, path.basename(xslt))
    );
    const sefNormalizedPath = path.normalize(sefFile);

    if (!fs.existsSync(xsltNormalizedPath)) {
      console.error(`❌ ERROR: XSLT file not found: ${xsltNormalizedPath}`);
      return;
    }

    console.log(`🚀 Processing: ${xsltNormalizedPath} -> ${sefNormalizedPath}`);

    try {
      await execCommand(
        `xslt3 -t -xsl:"${xsltNormalizedPath}" -export:"${sefNormalizedPath}" -nogo`
      );
      console.log(`✅ Success: ${sefNormalizedPath}`);
      sefFileCache2[xslt] = sefFile;
    } catch (error) {
      console.error(error);
    }
  }

  return sefFileCache2[xslt];
}

module.exports = { cacheSEFFile, cacheSEFFile2, clearTempData };
