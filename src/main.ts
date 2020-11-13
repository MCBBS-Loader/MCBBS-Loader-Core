import { deleteModule, installFromUrl, mountCode } from "./libs/codeload";
import manager from "./libs/manager";
import { checkUpdate } from "./libs/updator";
import {
  GMGetValue,
  GMLog,
  GMSetValue,
  setWindowProperty,
} from "./libs/usfunc";
import jQuery from "jquery";
import apiloader from "./libs/apiloader";
(() => {
  const RESET_TOKEN = Math.floor(
    Math.random() * 1048576 * 1048576 * 1048576
  ).toString(16);
  var sureToReset = false;
  setWindowProperty("reset_" + RESET_TOKEN, () => {
    if (sureToReset) {
      for (var c of Object.entries(GMGetValue("loader.all", {}))) {
        deleteModule(c[0]);
      }
      GMLog("[MCBBS Loader] 重置完成，下次别安装不可靠模块了~");
    } else {
      sureToReset = true;
      GMLog(
        "[MCBBS Loader] 确定要重置吗？这将移除所有模块，该过程不可撤销！\n如果确定重置，请再调用一次该函数。"
      );
    }
  });

  GMLog("[MCBBS Loader] 重置令牌：reset_" + RESET_TOKEN);
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
