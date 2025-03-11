const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const shell = require("shelljs");
const cors = require("cors");
const app = express();
app.use(express.json());

require("dotenv").config({ path: "./.env" });
const PORT = process.env.PORT || 2500;
const BASE = process.env.BASE;
const AdmZip = require("adm-zip");
const {
  prepareUserDirectories,
  removeUserIOFolder,
  createZipFile,
  cleanupUserFolder,
  copyImages,
} = require("./utils/helper");
const {
  setInputFileName,
  getInputFolderDir,
  getOutputFolderDir,
  resetTempJSONPath,
  resetUserFolderDirs,
} = require("./state/allVeriables");
const fileValidator = require("./utils/fileValidator");
const isValidDirectory = require("./utils/ValidDirectory");
const checkFilesInFolder = require("./utils/checkFilesInFolder");
const lastCleanUpAndTaskMaker = require("./utils/lastCleanUpAndTaskMaker");
const { clearTempData } = require("./utils/cacheSEFFile");
const { getLogData, resetLogData } = require("./state/logData");
app.use(cors());
app.use(fileUpload());

let inputFolderDir = "input";
const outputFolderPath = "output";

app.get("/", async (req, res) => {
  return res.status(200).json({
    message: "ARGOS Parser API",
    status: "Online",
  });
});

app.post("/api/upload", async (req, res) => {
  const userId = req.body.userId;

  try {
    const userInputDir = `${inputFolderDir}/${userId}/`;
    const userOutputDir = `${outputFolderPath}/${userId}/`;

    // Prepare user-specific directories
    prepareUserDirectories(userId, userInputDir, userOutputDir);

    if (!req.files || !req.files.zipFile) {
      return res
        .status(400)
        .json({ message: "No zip file provided", status: 400 });
    }

    const zipFile = req.files.zipFile;
    const inputFilePath = path.join(userInputDir, zipFile.name);
    setInputFileName(userId, zipFile.name);

    // Move the uploaded zip file to the user-specific input directory
    await zipFile.mv(inputFilePath);

    // Extract the zip file to the user-specific input folder
    const zip = new AdmZip(inputFilePath);
    zip.extractAllTo(userInputDir, true);

    // Remove zip file after extraction
    fs.unlinkSync(inputFilePath);

    // Validate files asynchronously
    fileValidator(userInputDir)
      .then(async (counts) => {
        if (counts.htmlCounter === 0) {
          // If no HTML files found, delete the user-specific input directory
          shell.rm("-rf", userInputDir);
          return res.status(400).json({
            message: "No XML files found in zip file.",
            status: 400,
          });
        } else {
          const filePath = path.join(__dirname, userInputDir);

          try {
            const files = await fs.promises.readdir(filePath);

            if (files.length === 0) {
              return res
                .status(400)
                .json({ message: "No files found in the folder", status: 400 });
            } else {
              return res.status(201).json({ message: "Ok", status: 201 });
            }
          } catch (err) {
            removeUserIOFolder(userId);
            return res
              .status(500)
              .json({ message: "Error reading folder", status: 500 });
          } finally {
            // allResults = [];
            // invalidFiles = [];
          }
        }
      })
      .catch((error) => {
        console.error("Error validating files:", error);
        removeUserIOFolder(userId);
        return res.status(500).json({
          message: "Internal server error during file validation",
          status: 500,
        });
      });
  } catch (error) {
    removeUserIOFolder(userId);
    console.error("Error handling file upload:", error);
    res.status(500).json({ message: "Internal server error", status: 500 });
  }
});

app.post("/api/xmltodita", async (req, res) => {
  const userId = req.body.userId;

  let userInputDir = getInputFolderDir(userId);
  let userOutputDir = getOutputFolderDir(userId);
  let downloadFolder = path.join(__dirname, "download", userId);

  try {
    // Check if input directory is valid
    const isValid = await isValidDirectory(userInputDir);
    if (!isValid) {
      return res
        .status(404)
        .json({ message: "Please upload zip file first!", status: 404 });
    }

    resetTempJSONPath(userId);
    resetLogData(userId);
    checkFilesInFolder(userInputDir, userId)
      .then(async () => {
        if (!fs.existsSync(userOutputDir)) {
          return res
            .status(404)
            .json({ message: "Output folder not found", status: 404 });
        }

        // const ignoredFileList = getLogData(userId);
        // copyImages(ignoredFileList.skippedFiles, userOutputDir);
        await lastCleanUpAndTaskMaker(userOutputDir, userId);

        // Create ZIP file of userOutputDir
        const zipFileName = `${userId}_output.zip`;
        const zipFilePath = path.join(downloadFolder, zipFileName);

        await createZipFile(userOutputDir, zipFilePath, userId);

        // Construct download link (modify based on your hosting)
        const downloadLink = `${BASE}/api/download/${userId}/${zipFileName}`;

        return res.status(201).json({
          message: "Files processed successfully",
          status: 201,
          downloadLink,
        });
      })
      .finally(() => {
        resetTempJSONPath(userId);
        resetUserFolderDirs(userId);
        resetLogData(userId);
        clearTempData();
        console.log("✅ All process completed successfully");
      })
      .catch((error) => {
        removeUserIOFolder(userId);
        console.error("Error processing files:", error);
        res
          .status(500)
          .json({ message: "Error processing files", status: 500 });
      });
  } catch (error) {
    removeUserIOFolder(userId);
    console.error("Error handling file upload:", error);
    res.status(500).json({ message: "Internal server error", status: 500 });
  }
});

// Download route
app.get("/api/download/:userId/:downloadId", async (req, res) => {
  const { userId, downloadId } = req.params;

  // Construct the file path inside the user's download folder
  const userFolder = path.join(__dirname, "download", userId);
  const filePath = path.join(userFolder, downloadId);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      message: "File not found!",
      status: 404,
    });
  }

  // Send the file as an attachment
  res.download(filePath, downloadId, (err) => {
    if (err) {
      console.error("❌ Error sending file:", err);
      return res.status(500).json({
        message: "Error downloading file",
        status: 500,
      });
    }

    // After successful download, delete the user folder
    cleanupUserFolder(userFolder);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
