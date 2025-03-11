const cheerio = require("cheerio");

function headingSequenceFix(fileData) {
  const $ = cheerio.load(fileData, { xmlMode: true });

  let expectedType = 1; // Start with 1 as per the first topic type
  let lastAssignedType = 1;

  $("topics > topic").each((index, elem) => {
    let currentType = parseInt($(elem).attr("type"));

    if (currentType !== lastAssignedType) {
      expectedType++;
    }

    $(elem).attr("type", expectedType);
    lastAssignedType = expectedType;
  });

  return $.xml();
}

module.exports = headingSequenceFix;
