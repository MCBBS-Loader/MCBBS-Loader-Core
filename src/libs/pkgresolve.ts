import { installFromUrl } from "./codeload";
import $ from "jquery";
$.ajaxSetup({
  timeout: 10000,
  cache: false,
});
class PackageURL {
  service: string = "github";
  version: string = "";
  id: string = "";
  file: string = "";
  provider: string = "";
  constructor(str: string) {
    var strs = str.split(":");
    switch (strs.length) {
      case 1:
        this.provider = "MCBBS-Loader";
        this.version = "";
        this.file = str + ".js";
        this.id = str;
        break;
      case 2:
        this.provider = strs[0];
        this.id = strs[1];
        this.file = this.id + ".js";
        this.version = "";
        break;
      case 3:
        this.provider = strs[0];
        this.id = strs[1];
        this.version = "";
        this.file = strs[2] + ".js";
        break;
      case 4:
        this.provider = strs[0];
        this.id = strs[1];
        this.file = strs[2] + ".js";
        this.version = "@" + strs[3];
    }
    if (strs.length > 4) {
      this.provider = strs[0];
      this.id = strs[1];
      this.file = strs[2] + ".js";
      this.version = "@" + strs[3];
    }
    try {
      $.get(
        `https://purge.jsdelivr.net/gh/${this.provider}/${this.id}${this.version}/${this.file}`
      );
    } catch {}
  }

  getAsURL() {
    return `https://cdn.jsdelivr.net/gh/${this.provider}/${this.id}${this.version}/${this.file}`;
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
