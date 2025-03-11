const fs = require("fs");
const path = require("path");

function copyImages1(imagePath, outputFolder) {
  if (!imagePath) {
    console.error("❌ Error: No image path provided.");
    return;
  }

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
}

module.exports = copyImages1;
