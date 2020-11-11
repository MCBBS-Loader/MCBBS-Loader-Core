import manager from "./libs/manager";
import { GMDeleteValue, GMGetValue, GMSetValue } from "./libs/usfunc";
(() => {
  manager.createBtn();
  manager.createMenu();
  if (GMGetValue("temp.loadmgr", false)) {
    GMSetValue("temp.loadmgr", false);
    manager.dumpManager();
  }
})();
