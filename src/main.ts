import {
  mountCode,
  resortDependency,
  setDependencyError,
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
import { setup } from "./libs/setupbattery";
import viewrepo from "./libs/viewrepo";
import { error } from "./libs/popinfo2";
const isManagerRegex = /bbsmod=manager/i;
main();
// verify(() => {});
function fixMuteScreen() {
  if($("#ct").hasClass("wp cl w")) {// 禁言用户无法打开设置界面，这里是对用户是否被禁言的判断
    $("#ct").remove();
    $("#wp").html(`<div id="pt" class="bm cl">
    <div class="z">
    <a href="./" class="nvhm" title="首页">Minecraft(我的世界)中文论坛</a> <em>›</em>
    <a href="home.php?mod=spacecp">设置</a> <em>›</em>个人资料
    </div>
    </div><div id="ct" class="ct2_a wp cl">
    <div class="mn">
    <div class="bm bw0" style="user-select: none;"></div>
    </div>
    <div class="appl"><div class="tbn">
    <h2 class="mt bbda">设置</h2>
    <ul>`);
  }
}

function main() {
  loadNTEVT();
  $.ajaxSetup({
    timeout: 10000,
    cache: false,
  });
  jQuery(() => {
    $("head")
      .append(
        "<link type='text/css' rel='stylesheet' href='https://cdn.staticfile.org/font-awesome/5.15.1/css/all.min.css'/>"
      )
      .append(
        "<link type='text/css' rel='stylesheet' href='https://cdn.staticfile.org/font-awesome/5.15.1/css/v4-shims.min.css'/>"
      );
    $("#debuginfo").after(
      `<br/><span>With MCBBS Loader Version ${getAPIVersion()}.<br/>MCBBS Loader 是独立的项目，与我的世界中文论坛没有从属关系</span>`
    );
  });
  /*
  if (GMGetValue("loader.ibatteries", true)) {
    setup(() => {});
    GMSetValue("loader.ibatteries", false);
  }*/

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
    let sortedList = GMGetValue("sorted-modules-list") || resortDependency();
    if (sortedList instanceof Array) {
      for (let id of sortedList) {
        mountCode(id, GMGetValue("code-" + id));
        ((id) => {
          checkUpdate(GMGetValue("meta-" + id, ""), (state, ov, nv) => {
            if (!state.startsWith("latest")) {
              console.log(
                `[MCBBS Loader] 有更新可用，模块 ${id} 具有新版本 ${nv}，当前安装的版本为 ${ov}。`
              );
            }
          });
        })(id);
      }
    } else {
      GMLog(`[MCBBS Loader] ${sortedList}`);
      GMLog("[MCBBS Loader] 所有模块均未加载，请到管理页面修复依赖关系错误");

      if (isManagerRegex.test(String(window.location.search))) {
        error(
          "<b>ECONFLICT！</b>自动加载模块失败，你现在正在模块管理页面，请解决依赖冲突。"
        );
      } else {
        error(
          "<b>ECONFLICT！</b>自动加载模块失败，请求人工管理模块，查看控制台信息并尝试解决依赖错误。"
        );
      }
      setDependencyError(sortedList);
    }

    // 这样可以在管理界面显示依赖关系是否满足
    manager.createBtn();
    manager.createMenu();
    var url = String(window.location.search);
    if (/bbsmod=repopreview/i.test(url)) {
      fixMuteScreen();
      var sharp = window.location.hash.indexOf("#");
      viewrepo.dumpPreview(sharp != -1 ? decodeURIComponent(window.location.hash.substring(1)) : "MCBBS-Loader/examplemod@main");
    }
    if (/bbsmod=manager/i.test(url)) {
      fixMuteScreen();
      $("title").html("MCBBS Loader - 自由的 MCBBS 模块管理器");
      manager.dumpManager();
      configpage.createMenu(); // config菜单只能从模块管理页面见到似乎更加合理
      // localconf.dumpLocalMenu();
    }
    if (GMGetValue("temp.loadcfg", false)) {
      GMSetValue("temp.loadcfg", false);
      configpage.dumpConfigPage();
    }
  });
}
