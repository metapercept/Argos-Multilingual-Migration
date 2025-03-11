const fs = require("fs");
const path = require("path");
const { isFileReady } = require("./helper");
const { getXSLTFileSequence } = require("../state/xsltFileSequence");
const {
  getTempJSONPath,
  getOutputFolderDir,
} = require("../state/allVeriables");

const {
  performTransformation,
  performTransformationOUTPUT,
} = require("./performTransformation");
const duplicateFileNameFixer = require("./duplicateFileNameFixer");
const { cacheSEFFile2 } = require("./cacheSEFFile");

// Main method to process individual files
module.exports = async function mainMethod(filePath, stats, userId) {
  try {
    if (!stats.isFile()) return;

    const parts = filePath.path.split(path.sep);
    const folderName = parts[parts.length - 2];

    const base = path.join(
      __dirname,
      "..",
      getOutputFolderDir(userId),
      folderName
    );

    // Ensure output directory exists
    await fs.promises.mkdir(base, { recursive: true });

    const ready = await isFileReady(filePath.path);
    if (!ready) return;

    let fileData = await fs.promises.readFile(filePath.path, "utf8");

    const fileSequence = getXSLTFileSequence();
    for (const xslt of fileSequence) {
      try {
        const sefFile = getTempJSONPath(userId)[xslt];
        fileData = await performTransformation(sefFile, fileData);

        if (xslt === "./xslt/6_FM_List_sequence.xsl") {
          fileData = duplicateFileNameFixer(fileData);
        }
      } catch (xsltError) {
        console.error(
          `Error processing XSLT file: ${xslt}`,
          xsltError,
          ":",
          filePath
        );
        return; // Skip processing this file but continue with others
      }
    }

    let safeFileData = fileData;

    // Run TOC Delayring - ./xslt/Delayring.xsl
    try {
      const sefFile = await cacheSEFFile2("./xslt/Delayring.xsl");
      await performTransformationOUTPUT(sefFile, fileData, base);
    } catch (tocError) {
      console.error("Error in TOC Delayring transformation", tocError);
    }

    // Run TOC XSLT - ./xslt/TOC.xsl
    try {
      const sefFile2 = await cacheSEFFile2("./xslt/TOC.xsl");
      await performTransformationOUTPUT(sefFile2, safeFileData, base);
    } catch (tocError2) {
      console.error("Error in TOC transformation", tocError2);
    }
  } catch (error) {
    console.error(`Error processing file: ${filePath.path}`, error);
  }
};
