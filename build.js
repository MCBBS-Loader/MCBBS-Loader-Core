const fs = require("fs");
var filename = process.argv[3] || "./dist/main.bundle.prod.user.js";

var mode = process.argv[2] || "nightly";
var outputname = `./dist/${mode}.bundle.prod.user.js`;
fs.readFile(filename, (e, data) => {
  if (e) {
    throw e;
  } else {
    try {
      fs.writeFile(
        outputname,
        fs.readFileSync(`./src/libs/ushead-${mode}.js`).toString() +
          "\n" +
          data.toString(),
        (e) => {
          if (e) {
            throw e;
          } else {
            console.log(`File ${outputname} emitted.`);
          }
        }
      );
    } catch (e) {
      throw e;
    }
  }
});
