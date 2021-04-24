import {
  getDependencyError,
  mountCode,
  resortDependency,
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
import { getUnsafeWindow, setLockedProperty } from "./libs/native";
import { forkAPI, getAPIVersion } from "./api/STDAPI";
import { loadNTEVT } from "./api/NTEVT";
import { getAPIToken } from "./libs/encrypt";
import viewrepo from "./libs/viewrepo";
import { COMMON_CSS } from "./libs/static";
import { loadEvents } from "./api/STDEVT";
import { DOMUtils, select } from "./libs/domutils"
const isManagerRegex = /bbsmod=manager/i;
main();
// verify(() => {});
function fixMuteScreen() {
  if (select("#ct").hasClass("wp cl w")) {// 禁言用户无法打开设置界面，这里是对用户是否被禁言的判断
    select("#ct").remove();
    select("#wp").html(`<div id="pt" class="bm cl">
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
  setWindowProperty("__onExtraScriptLoaded", (cb: () => any) => cb());
  DOMUtils.load(loadNTEVT).load(loadEvents).load(() => {
    select("head").append(
      `<link type='text/css' rel='stylesheet'
          href='https://cdn.staticfile.org/font-awesome/5.15.1/css/all.min.css'/>`
    ).append(
      `<link type='text/css' rel='stylesheet'
          href='https://cdn.staticfile.org/font-awesome/5.15.1/css/v4-shims.min.css'/>`
    ).append(`<style id="mcbbs-loader-common-css">${COMMON_CSS}</style>`);
    select("#debuginfo").after(
      `<br/><span>With MCBBS Loader Version ${getAPIVersion()}.<br/>MCBBS Loader 是独立的项目，与我的世界中文论坛没有从属关系</span>`
    );
  });

  GMLog(`[MCBBS Loader] 加载器和 API 版本：${getAPIVersion()}`);
  const RESET_TOKEN = Math.floor(
    Math.random() * 1048576 * 1048576 * 1048576 * 1048576
  ).toString(16);
  let sureToReset = false;
  setLockedProperty(getUnsafeWindow(), "reset_" + RESET_TOKEN, () => {
    if (sureToReset) {
      let all = GMGetValue("loader.all", {});
      for (let c of Object.entries(all))
        all[c[0]] = false;
      GMSetValue("loader.all", all);
      setWindowProperty("loader.all", all);
      GMLog("[MCBBS Loader] 重置完成，下次别安装不可靠模块了~");
    } else {
      sureToReset = true;
      GMLog("[MCBBS Loader] 确定要重置吗？这将禁用所有模块！\n如果确定重置，请再调用一次该函数。");
    }
  });

  GMLog("[MCBBS Loader] 重置令牌：reset_" + RESET_TOKEN);
  setLockedProperty(getUnsafeWindow(), "forkAPI_" + getAPIToken(), forkAPI);
  setWindowProperty("CDT", []);
  let all = GMGetValue("loader.all", {});
  for (let [id, enabled] of Object.entries(all))
    if (enabled && GMGetValue("meta-" + id, {}).permissions.indexOf("loader:earlyload") != -1)
      try {
        eval(`(() => {let MCBBS = null; ${GMGetValue("code-" + id)}})()`);
      } catch (ex) {
        console.error(ex);// 不要殃及其他部分
      }
  DOMUtils.load(() => {
    // 用户可能是从老版本升级上来的，因此需要立即补全排序好的依赖信息
    let sortedList = GMGetValue("loader.sortedModuleList") || resortDependency();
    for (let id of sortedList) {
      mountCode(id, GMGetValue("code-" + id));
      (id => {
        checkUpdate(GMGetValue("meta-" + id, ""), (state, ov, nv) => {
          if (!state.startsWith("latest"))
            console.log(`[MCBBS Loader] 有更新可用，模块 ${id} 具有新版本 ${nv}，当前安装的版本为 ${ov}。`);
        });
      })(id);
    }
    let errmsg = getDependencyError();
    if (errmsg.length)
      GMLog("[MCBBS Loader] 部分模块未加载，请到管理页面修复依赖关系错误");

    // 这样可以在管理界面显示依赖关系是否满足
    manager.createBtn();
    manager.createMenu();
    let url = String(window.location.search);
    if (/bbsmod=repopreview/i.test(url)) {
      fixMuteScreen();
      let sharp = window.location.hash.indexOf("#");
      viewrepo.dumpPreview(sharp != -1 ? decodeURIComponent(window.location.hash.substring(1)) : "MCBBS-Loader/examplemod@main");
    } else if (/bbsmod=manager/i.test(url)) {
      fixMuteScreen();
      manager.dumpManager();
    } else if (/bbsmod=config/i.test(url)) {
      fixMuteScreen();
      setTimeout(() => configpage.dumpConfigPage(), 0);// 这里必须要timeout，因为要等模块注册config
    }
  });
}
