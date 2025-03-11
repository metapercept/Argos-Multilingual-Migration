const SaxonJS = require("saxon-js");

async function performTransformation(sefFile, result) {
  return new Promise((resolve, reject) => {
    try {
      const output = SaxonJS.transform({
        stylesheetFileName: sefFile,
        sourceText: result,
        destination: "serialized",
      }).principalResult;
      resolve(output);
    } catch (error) {
      reject(error);
    }
  });
}

async function performTransformationOUTPUT(sefFile, result, outputDir) {
  return new Promise((resolve, reject) => {
    try {
      const output = SaxonJS.transform({
        stylesheetFileName: sefFile,
        sourceText: result,
        destination: "serialized",
        baseOutputURI: `file://${outputDir}/`,
      }).principalResult;
      resolve(output);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { performTransformation, performTransformationOUTPUT };
