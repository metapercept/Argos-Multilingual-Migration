const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

const shell = require("shelljs");
const {
  setInputFolderDir,
  setOutputFolderDir,
} = require("../state/allVeriables");

// Prepare user-specific directories
function prepareUserDirectories(userId, inputDir, outputDir) {
  setInputFolderDir(userId, inputDir);
  setOutputFolderDir(userId, outputDir);

  shell.rm("-rf", inputDir);
  shell.mkdir("-p", inputDir);

  shell.rm("-rf", outputDir);
  shell.mkdir("-p", outputDir);
}

// Function to remove the user input and output folders
function removeUserIOFolder(userId) {
  const userInputFolderPath = path.join("input", userId.toString());
  const userOutputFolderPath = path.join("output", userId.toString());

  try {
    // Remove both the input and output folders for the user
    shell.rm("-rf", userInputFolderPath);
    shell.rm("-rf", userOutputFolderPath);
    console.log(
      `Folders ${userInputFolderPath} and ${userOutputFolderPath} have been removed.`
    );
  } catch (error) {
    console.error(
      `Error removing folders ${userInputFolderPath} or ${userOutputFolderPath}:`,
      error
    );
  }
}

// Function to check if the file is ready
function isFileReady(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.constants.R_OK, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// Function to create ZIP file in user-specific folder
async function createZipFile(sourceDir, zipPath) {
  return new Promise((resolve, reject) => {
    const userDownloadFolder = path.dirname(zipPath); // Get user-specific folder

    // Ensure the user-specific download folder exists
    if (!fs.existsSync(userDownloadFolder)) {
      fs.mkdirSync(userDownloadFolder, { recursive: true });
    }

    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

// Function to handle errors
function handleError(error, userId, res, message = "Internal server error") {
  console.error(message, error);
  removeUserIOFolder(userId);
  res.status(500).json({ message, status: 500 });
}

// Function to delete a folder and its contents
function cleanupUserFolder(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error(`❌ Error deleting folder: ${folderPath}`, err);
      } else {
        console.log(`🗑️ User folder deleted: ${folderPath}`);
      }
    });
  }
}

// Function to copy images to the output folder
function copyImages(imagePaths, outputFolder) {
  console.log("👉 [helper.js:100]: imagePaths: ", imagePaths);
  imagePaths.forEach((imagePath) => {
    const imageFolder = path.dirname(imagePath);

    const parentFolder = path.basename(path.dirname(imageFolder));

    const parentFolderPath = path.join(outputFolder, parentFolder);
    const imagesFolder = path.join(parentFolderPath, "image");

    if (!fs.existsSync(imagesFolder)) {
      fs.mkdirSync(imagesFolder, { recursive: true });
    }

    const imageName = path.basename(imagePath);

    const ext = path.extname(imageName);
    const nameWithoutExt = path.basename(imageName, ext);

    // Rename the image: add "i_" at the beginning and replace '.', ',', '-' with '_'
    const renamedImage = "i_" + nameWithoutExt.replace(/[.,-\s]/g, "_") + ext;

    const dest = path.join(imagesFolder, renamedImage);

    try {
      fs.copyFileSync(imagePath, dest);
    } catch (error) {
      console.error(`❌ Error copying ${imageName}: ${error.message}`);
    }
  });

  console.log("✅ All images copied successfully.");
}

module.exports = {
  prepareUserDirectories,
  removeUserIOFolder,
  isFileReady,
  createZipFile,
  handleError,
  cleanupUserFolder,
  copyImages,
};
