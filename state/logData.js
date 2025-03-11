const userLogData = {};

function getUserLogData(userId) {
  if (!userLogData[userId]) {
    userLogData[userId] = {
      missingTags: {},
      handledTags: {},
      skippedFiles: [],
    };
  }
  return userLogData[userId];
}

function getLogData(userId) {
  return getUserLogData(userId);
}

function addMissingTags(userId, type, isMissing) {
  getUserLogData(userId).missingTags[type] = isMissing;
}

function addHandledTags(userId, type, isMissing) {
  getUserLogData(userId).handledTags[type] = isMissing;
}

function addSkippedFiles(userId, filePath) {
  getUserLogData(userId).skippedFiles.push(filePath);
}

function resetLogData(userId) {
  const logData = getUserLogData(userId);
  logData.missingTags = {};
  logData.handledTags = {};
  logData.skippedFiles = [];
}

module.exports = {
  addMissingTags,
  addHandledTags,
  getLogData,
  addSkippedFiles,
  resetLogData,
};
