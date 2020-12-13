import { deleteModule, installFromUrl, mountCode } from "./libs/codeload";
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
import { getProperty, getUnsafeWindow, setLockedProperty } from "./libs/native";
import { forkAPI, getAPIVersion } from "./api/NTAPI";
import { loadNTEVT } from "./api/NTEVT";
import { getAPIToken } from "./libs/encrypt";
import { popinfo } from "./libs/popinfo";
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
    // setup(() => {});
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
    manager.createBtn();
    manager.createMenu();
    var isManagerRegex = /bbsmod\=manager/i;
    if (isManagerRegex.test(String(window.location.search))) {
      $("title").html("MCBBS Loader - 自由的 MCBBS 模块管理器");
      manager.dumpManager();
    }
    configpage.createMenu();
    if (GMGetValue("temp.loadcfg", false)) {
      GMSetValue("temp.loadcfg", false);
      configpage.dumpConfigPage();
    }
    // 哨兵节点，用于标记链表末尾
    const mapNil = {
      before: null,
      after: null,
      beforeNext: null,
      afterNext: null,
      beforePrev: null,
      afterPrev: null,
    };
    var fixRaw = (id: string, raw: any) => {
      raw.beforeHead = mapNil;
      raw.afterHead = mapNil;
      raw.done = false;
      raw.id = id;
      return raw;
    };
    // 邻接表
    var dependencies = new Map<string, object>();
    var stack: object[] = [];
    var sortedList = [];
    for (var [id, enabled] of Object.entries(GMGetValue("loader.all", {}))) {
      if (enabled) {
        dependencies.set(
          id,
          fixRaw(id, JSON.parse(GMGetValue("depend-" + id, "{}")))
        );

        checkUpdate(GMGetValue("meta-" + id, ""), (state) => {
          if (state != "latest") {
            installFromUrl(state);
          }
        });
      }
      if (
        GMGetValue("meta-" + id, "").apiVersion != getAPIVersion() &&
        GMGetValue("meta-" + id, "").apiVersion != undefined
      ) {
        deleteModule(id, () => {
          console.log(
            "[MCBBS Loader] 由于 API 版本不兼容，移除了 ID 为 " +
              id +
              " 的脚本。\n如有需要，你可以重新安装。"
          );
        });
      }
    }
    try {
      // 排个序
      var insert = (before: any, after: any) => {
        var node: any = {
          before: before,
          after: after,
          beforeNext: before.beforeHead,
          afterNext: after.afterHead,
          beforePrev: mapNil,
          afterPrev: mapNil,
        };
        node.beforeNext.beforePrev = node.afterNext.afterPrev = node;
        after.afterHead = before.beforeHead = node;
      };
      var unlink = (node: any) => {
        node.afterNext.afterPrev = node.afterPrev;
        node.beforeNext.beforePrev = node.beforePrev;
        node.afterPrev.afterNext = node.afterNext;
        node.beforePrev.beforeNext = node.beforeNext;
        if (node === node.after.afterHead) {
          node.after.afterHead = node.afterNext;
        }
        if (node === node.before.beforeHead) {
          node.before.beforeHead = node.beforeNext;
        }
        // 如果它不需要在某个插件之后加载，那下一个就加载它
        if (mapNil === node.after.afterHead) {
          stack.push(node.after);
        }
      };
      dependencies.forEach((v, k) => {
        var depend = getProperty(v, "depend");
        if (depend instanceof Array) {
          depend.forEach((e) => {
            if (!dependencies.get(e)) {
              throw `依赖关系无解，${k}依赖${e}，但是后者未安装或未启用`;
            }
          });
        }
        var before = getProperty(v, "before");
        if (before instanceof Array) {
          before.forEach((e) => {
            var target = dependencies.get(e);
            if (target) {
              insert(v, target);
            }
          });
        }
        var after = getProperty(v, "after");
        if (after instanceof Array) {
          after.forEach((e) => {
            var target = dependencies.get(e);
            if (target) {
              insert(target, v);
            }
          });
        }
      });
      dependencies.forEach((v) => {
        if ((v as any).afterHead === mapNil) {
          stack.push(v);
        }
      });
      while (stack.length) {
        var process = stack.pop() as any;
        sortedList.push(process);
        // 加个排序完成标记，解除其他插件需要在本插件之后加载的限制
        process.done = true;
        while (mapNil != process.beforeHead) {
          unlink(process.beforeHead);
        }
      }
      // 如果排序已经结束了还有插件没有进入到序列里来，那么排序一定无解
      var problemMods: string[] = [];
      dependencies.forEach((v, k) => {
        if (!(v as any).done) {
          problemMods.push((v as any).id);
        }
      });
      if (problemMods.length) {
        throw `依赖关系无解，${problemMods}的加载顺序冲突`;
      }
      sortedList.forEach((v) => {
        var id = v.id;
        mountCode(id, GMGetValue("code-" + id, "") || "");
      });
    } catch (ex) {
      GMLog(`[ MCBBS Loader ] ${ex}`);
      GMLog(
        "[ MCBBS Loader ] 所有插件均未成功加载，请到管理页面修复依赖关系错误"
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
    }
  });
})();
