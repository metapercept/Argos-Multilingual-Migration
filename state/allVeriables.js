const userInpFile = {};
const USER_BASED_IO_PATH = {};
const sefFileCache = {};
const sefFileCache2 = {};

function UserBasedIOPath(userId) {
  if (!USER_BASED_IO_PATH[userId]) {
    USER_BASED_IO_PATH[userId] = {
      input_dir: "",
      output_dir: "",
    };
  }
  return USER_BASED_IO_PATH[userId];
}

function getInputFolderDir(userId) {
  return UserBasedIOPath(userId).input_dir;
}

function getOutputFolderDir(userId) {
  return UserBasedIOPath(userId).output_dir;
}

function setInputFolderDir(userId, inputDir) {
  UserBasedIOPath(userId).input_dir = inputDir;
}

function setOutputFolderDir(userId, outputDir) {
  UserBasedIOPath(userId).output_dir = outputDir;
}

function resetUserFolderDirs(userId) {
  const userPaths = UserBasedIOPath(userId);
  userPaths.input_dir = "";
  userPaths.output_dir = "";
}

function setInputFileName(userId, fileName) {
  userInpFile[userId] = fileName;
}

function getInputFileName(userId) {
  return userInpFile[userId];
}

function resetInputFileName(userId) {
  delete userInpFile[userId];
}

// Setter: Store unique SEF file paths for a user
function setTempJSONPath(userId, filePath) {
  if (!sefFileCache[userId]) {
    sefFileCache[userId] = new Set(); // Initialize as a Set
  }
  sefFileCache[userId].add(filePath); // Ensures uniqueness
}

// Getter: Retrieve all cached SEF file paths for a user
function getTempJSONPath(userId) {
  return sefFileCache[userId] ? Array.from(sefFileCache[userId])[0] : []; // Convert Set to Array
}

function resetTempJSONPath(userId) {
  delete sefFileCache[userId];
}

module.exports = {
  setInputFileName,
  getInputFileName,
  resetInputFileName,
  setInputFolderDir,
  setOutputFolderDir,
  getInputFolderDir,
  getOutputFolderDir,
  resetUserFolderDirs,
  setTempJSONPath,
  getTempJSONPath,
  resetTempJSONPath,
};
