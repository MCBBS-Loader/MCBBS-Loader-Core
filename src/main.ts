import { mountCode } from "./libs/codeload";
import manager from "./libs/manager";
import { GMGetValue, GMSetValue } from "./libs/usfunc";
(() => {
  manager.createBtn();
  manager.createMenu();
  if (GMGetValue("temp.loadmgr", false)) {
    GMSetValue("temp.loadmgr", false);
    manager.dumpManager();
  }
  console.log(GMGetValue("loader.all", {}));
  for (var c of Object.entries(GMGetValue("loader.all", {}))) {
    mountCode(c[0], GMGetValue("code-" + c[0], "") || "");
  }
})();
