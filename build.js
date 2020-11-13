const fs = require("fs");
var filename = process.argv[2] || "./dist/main.bundle.prod.js";
fs.readFile(filename, (e, data) => {
  if (e) {
    throw e;
  } else {
    try {
      fs.writeFile(
        filename,
        fs.readFileSync("./src/libs/ushead.js").toString() +
          "\n" +
          data.toString(),
        (e) => {
          if (e) {
            throw e;
          } else {
            console.log(`File ${filename} emitted.`);
          }
        }
      );
    } catch (e) {
      throw e;
    }
  }
});
