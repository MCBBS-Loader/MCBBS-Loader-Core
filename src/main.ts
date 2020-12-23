import {
  installFromUrl,
  isDirty,
  mountCode,
  resortDependency,
  setDenpendencySolved,
} from "./libs/codeload";
import manager from "./libs/manager";
import configpage from "./libs/configpage";
import { checkUpdate } from "./libs/updator";
import {
  GMGetValue,
  GMLog,
  GMSetValue,
  setWindowProperty,
} from "./libs/usfunc";
import jQuery from "jquery";
import $ from "jquery";
import { getUnsafeWindow, setLockedProperty } from "./libs/native";
import { forkAPI, getAPIVersion } from "./api/NTAPI";
import { loadNTEVT } from "./api/NTEVT";
import { getAPIToken } from "./libs/encrypt";
import { popinfo } from "./libs/popinfo";
import { setup } from "./libs/setupbattery";
(() => {
  loadNTEVT();
  jQuery(() => {
    $("head").append(
      "<link type='text/css' rel='stylesheet' href='https://cdn.staticfile.org/font-awesome/5.15.1/css/all.min.css'></link>"
    );

    $("head").append(
      "<link type='text/css' rel='stylesheet' href='https://cdn.staticfile.org/font-awesome/5.15.1/css/v4-shims.min.css'></link>"
    );
  });
  if (GMGetValue("loader.ibatteries", true)) {
    setup(() => {});
    GMSetValue("loader.ibatteries", false);
  }
  GMLog(`[MCBBS Loader] 加载器和 API 版本：${getAPIVersion()}`);
  const RESET_TOKEN = Math.floor(
    Math.random() * 1048576 * 1048576 * 1048576 * 1048576
  ).toString(16);
  var sureToReset = false;
  setLockedProperty(getUnsafeWindow(), "reset_" + RESET_TOKEN, () => {
    if (sureToReset) {
      var all = GMGetValue("loader.all", {});
      for (var c of Object.entries(all)) {
        all[c[0]] = false;
      }
      GMSetValue("loader.all", all);
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
  setLockedProperty(getUnsafeWindow(), "forkAPI_" + getAPIToken(), forkAPI);
  setWindowProperty("CDT", []);
  jQuery(() => {
    // 用户可能是从老版本升级上来的，因此需要立即补全排序好的依赖信息
    var sortedList = GMGetValue("sorted-modules-list") || resortDependency();
    if (sortedList instanceof Array) {
      for (var id of sortedList) {
        mountCode(id, GMGetValue("code-" + id));
        checkUpdate(GMGetValue("meta-" + id, ""), (state, ov, nv) => {
          if (!state.startsWith("latest")) {
            // installFromUrl(state);
            console.log(
              `[MCBBS Loader] 有更新可用，模块 ${id} 具有新版本 ${nv}，当前安装的版本为 ${ov}。`
            );
          }
        });
      }
      setDenpendencySolved(true);
    } else {
      GMLog(`[MCBBS Loader] ${sortedList}`);
      GMLog(
        "[MCBBS Loader] 所有模块均未成功加载，请到管理页面修复依赖关系错误"
      );
      var isManagerRegex = /bbsmod\=manager/i;
      if (isManagerRegex.test(String(window.location.search))) {
        popinfo(
          "exclamation-circle",
          "<b>ECONFLICT！</b>自动加载模块失败，你现在正在模块管理页面，请解决依赖冲突。",
          true,
          "background-color:#88272790!important;"
        );
      } else {
        popinfo(
          "exclamation-circle",
          "<b>ECONFLICT！</b>自动加载模块失败，请求人工管理模块，查看控制台信息并尝试解决依赖错误。",
          true,
          "background-color:#88272790!important;"
        );
      }
      setDenpendencySolved(false);
    }
    // 这样可以在管理界面显示依赖关系是否满足
    manager.createBtn();
    manager.createMenu();
    if (/bbsmod\=manager/i.test(String(window.location.search))) {
      $("title").html("MCBBS Loader - 自由的 MCBBS 模块管理器");
      manager.dumpManager();
      configpage.createMenu(); // config菜单只能从模块管理页面见到似乎更加合理
    }
    if (GMGetValue("temp.loadcfg", false)) {
      GMSetValue("temp.loadcfg", false);
      configpage.dumpConfigPage();
    }
  });
})();
