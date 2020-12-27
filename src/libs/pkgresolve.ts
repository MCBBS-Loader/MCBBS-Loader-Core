import { installFromUrl } from "./codeload";

class PackageURL {
  service: string = "github";
  version: string = "";
  id: string = "";
  provider: string = "";
  constructor(str: string) {
    var strs = str.split(":");
    switch (strs.length) {
      case 1:
        this.provider = "MCBBS-Loader";
        this.version = "main";
        this.id = str;
        break;
      case 2:
        this.provider = strs[0];
        this.id = strs[1];
        this.version = "main";
        break;
      case 3:
        this.provider = strs[0];
        this.id = strs[1];
        this.version = strs[2];
        break;
    }
    if (strs.length > 3) {
      this.provider = strs[0];
      this.id = strs[1];
      this.version = strs[2];
    }
  }
  getAsURL() {
    return `https://cdn.jsdelivr.net/gh/${this.provider}/${this.id}@${this.version}/${this.id}.mcbbs.js`;
  }
}
function installDependenciesStrict(
  depurl: string[],
  onsuccess: () => void,
  onerror: (err: string) => void
) {
  var onerror_called = false;
  var count = 0;
  function updateCount() {
    count = count + 1;
    if (count >= depurl.length) {
      onsuccess();
    }
  }
  for (var u of depurl) {
    var url = new PackageURL(u).getAsURL();
    installFromUrl(
      url,
      () => {
        updateCount();
      },
      () => {
        if (!onerror_called) {
          onerror_called = true;
          onerror(u);
        }
      }
    );
  }
}

export { PackageURL, installDependenciesStrict };
