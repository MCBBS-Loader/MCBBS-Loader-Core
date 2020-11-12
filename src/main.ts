import { installFromUrl, mountCode } from "./libs/codeload";
import manager from "./libs/manager";
import { checkUpdate } from "./libs/updator";
import { GMGetValue, GMSetValue } from "./libs/usfunc";
import jQuery from "jquery";
import apiloader from "./libs/apiloader";
(() => {
  jQuery(() => {
    apiloader.loadAll();
    manager.createBtn();
    manager.createMenu();
    if (GMGetValue("temp.loadmgr", false)) {
      GMSetValue("temp.loadmgr", false);
      manager.dumpManager();
    }
    for (var c of Object.entries(GMGetValue("loader.all", {}))) {
      checkUpdate(GMGetValue("meta-" + c[0], ""), (state) => {
        if (state != "latest") {
          installFromUrl(state);
        }
        mountCode(c[0], GMGetValue("code-" + c[0], "") || "");
      });
    }
  });
})();
