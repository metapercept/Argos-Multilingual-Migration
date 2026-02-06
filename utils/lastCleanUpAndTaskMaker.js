const fs = require("fs");
const path = require("path");
const { performTransformation } = require("./performTransformation");
const { cacheSEFFile2 } = require("./cacheSEFFile");

async function lastCleanUpAndTaskMaker(outputFolderPath, userId) {
  try {
    const files = await fs.promises.readdir(outputFolderPath);

    const fileProcessingPromises = [];

    const sefFile = await cacheSEFFile2("./xslt/convert-to-task.xsl");
    const sefFile1 = await cacheSEFFile2("./xslt/Last_cleanup.xsl");

    for (const file of files) {
      const filePath = path.join(outputFolderPath, file);

      const stats = await fs.promises.stat(filePath);
      if (stats.isDirectory()) {
        fileProcessingPromises.push(lastCleanUpAndTaskMaker(filePath, userId));
      } else if (stats.isFile() && file.endsWith(".dita")) {
        fileProcessingPromises.push(
          processDitaFile(filePath, userId, sefFile, sefFile1)
        );
      } else if (stats.isFile() && file.endsWith(".ditamap")) {
        fileProcessingPromises.push(processDitaMapFile(filePath, sefFile1));
      }
    }

    // Wait for all file processing promises to resolve
    await Promise.all(fileProcessingPromises);
  } catch (error) {
    console.error("Error reading directory:", error);
    throw error;
  }
}

async function processDitaFile(filePath, userId, sefFile, sefFile1) {
  try {
    let fileData = await fs.promises.readFile(filePath, "utf8");
    fileData = await performTransformation(sefFile, fileData);
    fileData = await performTransformation(sefFile1, fileData);

    // Write the transformed data back to the same file
    await fs.promises.writeFile(filePath, fileData, "utf8");
  } catch (error) {
    console.error("Error processing DITA file:", error);
    throw error;
  }
}

async function processDitaMapFile(filePath, sefFile1) {
  try {
    let fileData = await fs.promises.readFile(filePath, "utf8");
    fileData = await performTransformation(sefFile1, fileData);

    // Write the transformed data back to the same file
    await fs.promises.writeFile(filePath, fileData, "utf8");
  } catch (error) {
    console.error("Error processing DITA map file:", error);
    throw error;
  }
}

module.exports = lastCleanUpAndTaskMaker;
