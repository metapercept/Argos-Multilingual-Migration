const cheerio = require("cheerio");

function duplicateFileNameFixer(fileData) {
  try {
    const $ = cheerio.load(fileData, { xmlMode: true });
    const filenameCounts = {};

    $("topic").each((_, elem) => {
      const topic = $(elem);
      let filename = topic.attr("filename");

      if (filename) {
        // Remove unwanted quotes
        filename = filename.replace(/["'“”‘’]/g, "");

        // ✅ Update the filename attribute after modification
        topic.attr("filename", filename);

        if (filenameCounts[filename]) {
          filenameCounts[filename]++;
          const newFilename = `${filename}_${filenameCounts[filename]}`;
          topic.attr("filename", newFilename);
        } else {
          filenameCounts[filename] = 1;
        }
      }
    });

    return $.xml()
      .replace(/\n+/g, "")
      .replace(/\s+</g, "<")
      .replace(/>\s+/g, ">");
  } catch (error) {
    console.error("Error in duplicateFileNameFixer:", error);
    return fileData; // Return original data to avoid breaking the pipeline
  }
}

module.exports = duplicateFileNameFixer;
