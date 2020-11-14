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
import AInfo from "./api/AInfo";
(() => {
  GMLog(`[MCBBS Loader] 加载器和 API 版本：${AInfo.getAPIVersion()}`);
  const RESET_TOKEN = Math.floor(
    Math.random() * 1048576 * 1048576 * 1048576
  ).toString(16);
  var sureToReset = false;
  setWindowProperty("reset_" + RESET_TOKEN, () => {
    if (sureToReset) {
      var all = GMGetValue("loader.all", {});
      for (var c of Object.entries(all)) {
        all[c[0]] = false;
      }
      setWindowProperty("loader.all", all);
      GMLog("[MCBBS Loader] 重置完成，下次别安装不可靠模块了~");
    } else {
      sureToReset = true;
      GMLog(
        "[MCBBS Loader] 确定要重置吗？这将禁用所有模块！\n如果确定重置，请再调用一次该函数。"
      );
    }
  });

  GMLog("[MCBBS Loader] 重置令牌：reset_" + RESET_TOKEN);

  apiloader.loadAll();
  jQuery(() => {
    manager.createBtn();
    manager.createMenu();
    if (GMGetValue("temp.loadmgr", false)) {
      GMSetValue("temp.loadmgr", false);
      manager.dumpManager();
    }
    for (var c of Object.entries(GMGetValue("loader.all", {}))) {
      var a = c[0];
      var b = c[1];
      if (b) {
        mountCode(a, GMGetValue("code-" + a, "") || "");
        checkUpdate(GMGetValue("meta-" + a, ""), (state) => {
          if (state != "latest") {
            installFromUrl(state);
          }
        });
      }
    }
  });
})();
