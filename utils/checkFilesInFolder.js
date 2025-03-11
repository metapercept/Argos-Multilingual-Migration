const fs = require("fs");
const path = require("path");
const mainMethod = require("./mainMethod");
const { cacheSEFFile, cacheSEFFile2 } = require("./cacheSEFFile");

const { getXSLTFileSequence } = require("../state/xsltFileSequence");
const { addSkippedFiles } = require("../state/logData");
const copyImages1 = require("./copyImages1");
const { getOutputFolderDir } = require("../state/allVeriables");

const xsltDirectory = "./xslt/";
const tempDirectory = path.join(xsltDirectory, "temp");

// Function to check files in a folder
module.exports = async function checkFilesInFolder(folderPath, userId) {
  try {
    // Ensure temp directory exists
    if (!fs.existsSync(tempDirectory)) {
      fs.mkdirSync(tempDirectory, { recursive: true });
    }

    // Cache all SEF files before processing
    await Promise.all(
      getXSLTFileSequence().map((xslt) => cacheSEFFile(xslt, userId))
    );

    const files = await fs.promises.readdir(folderPath);

    const fileProcessingPromises = files.map(async (file) => {
      try {
        const filePath = path.join(folderPath, file);
        const stats = await fs.promises.stat(filePath);

        if (stats.isDirectory()) {
          return checkFilesInFolder(filePath, userId);
        } else if (stats.isFile() && file.endsWith(".xml")) {
          return mainMethod({ name: file, path: filePath }, stats, userId);
        } else {
          // Handle non-XML files
          addSkippedFiles(userId, filePath);
          return copyImages1(filePath, getOutputFolderDir(userId));
        }
      } catch (fileError) {
        console.error(`Error processing file: ${file}`, fileError);
        // Continue processing other files even if one fails
      }
    });

    // ✅ Ensure all files are processed, even if some fail
    await Promise.allSettled(fileProcessingPromises);
  } catch (error) {
    console.error("Error reading directory: ==>", error);
  }
};
