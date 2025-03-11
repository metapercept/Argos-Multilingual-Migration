const fs = require("fs");
const path = require("path");

// Function to validate the files in the folder
async function fileValidator(folderPath) {
  try {
    const files = await fs.promises.readdir(folderPath);
    let htmlCounter = 0;
    let otherCounter = 0;

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.promises.stat(filePath);

      if (stats.isDirectory()) {
        const { htmlCounter: htmlCount, otherCounter: subOtherCount } =
          await fileValidator(filePath);
        htmlCounter += htmlCount;
        otherCounter += subOtherCount;
      } else if (stats.isFile() && /\.(xml)$/i.test(file)) {
        htmlCounter++;
      } else {
        otherCounter++;
      }
    }

    return { htmlCounter, otherCounter };
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

module.exports = fileValidator;
