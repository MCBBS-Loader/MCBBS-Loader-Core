import { installFromUrl, mountCode } from "./libs/codeload";
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
import apiloader from "./libs/apiloader";
import AInfo from "./api/AInfo";
import { setup } from "./libs/setupbattery";
import { getProperty } from "./libs/native";
(() => {
  if (GMGetValue("loader.ibatteries", true)) {
    setup(() => {});
    GMSetValue("loader.ibatteries", false);
  }
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
  apiloader.loadAll();
  setWindowProperty("CDT", []);
  jQuery(() => {
    manager.createBtn();
    manager.createMenu();
    if (
      String(window.location) ===
      "https://www.mcbbs.net/home.php?mod=spacecp&bbsmod=manager"
    ) {
      manager.dumpManager();
    }
    configpage.createMenu();
    if (GMGetValue("temp.loadcfg", false)) {
      GMSetValue("temp.loadcfg", false);
      configpage.dumpConfigPage();
    }
    var fixRaw = (name: string, raw: any) => {
      raw.beforeHead = null;
      raw.afterHead = null;
      raw.done = false;
      raw.name = name;
      return raw;
    };
    var dependencies = new Map<string, object>();
    var stack: object[] = [];
    var sortedList = [];
    for (var [name, enabled] of Object.entries(GMGetValue("loader.all", {}))) {
      if (enabled) {
        // dependencies.set(name, fixRaw(name, JSON.parse(GMGetValue("depend-" + name, "{}"))));
        // fixRaw 是干什么的？第一个参数貌似缺少
        checkUpdate(GMGetValue("meta-" + name, ""), (state) => {
          if (state != "latest") {
            installFromUrl(state);
          }
        });
      }
    }
    try {
      // 排个序
      // 邻接表
      var insert = (before: any, after: any) => {
        var node: any = {
          before: before,
          after: after,
          beforeNext: before.beforeHead,
          afterNext: after.afterHead,
          beforePrev: null,
          afterPrev: null,
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
        if (!node.after.afterHead) {
          stack.push(node.after);
        }
      };
      dependencies.forEach((v, k) => {
        var depend = getProperty(v, "depend");
        if (depend instanceof Array) {
          depend.forEach((e, i) => {
            if (!dependencies.get(e)) {
              throw `依赖关系无解，${k}依赖${e}，但是后者未安装或未启用`;
            }
          });
        }
        var before = getProperty(v, "before");
        if (before instanceof Array) {
          before.forEach((e, i) => {
            var target = dependencies.get(e);
            if (target) {
              insert(v, e);
            }
          });
        }
        var after = getProperty(v, "after");
        if (after instanceof Array) {
          after.forEach((e, i) => {
            var target = dependencies.get(e);
            if (target) {
              insert(e, v);
            }
          });
        }
      });
      dependencies.forEach((v, k) => {
        if ((v as any).afterHead === null) {
          stack.push(v);
        }
      });
      while (stack.length) {
        var process = stack.pop() as any;
        sortedList.push(process);
        // 加个排序完成标记，解除其他插件需要在本插件之后加载的限制
        process.done = true;
        while (process.beforeHead) {
          unlink(process.beforeHead);
        }
      }
      // 如果排序已经结束了还有插件没有进入到序列里来，那么排序一定无解
      dependencies.forEach((v, k) => {
        if (!(v as any).done) {
          throw `依赖关系无解，${k}需要在${
            getProperty(v, "afterHead")["name"]
          }前加载，而后者需要在前者之前加载`;
        }
      });
      sortedList.forEach((v, k) => {
        var name = v.name;
        mountCode(name, GMGetValue("code-" + name, "") || "");
      });
    } catch (ex) {
      GMLog(`[ MCBBS Loader ] ${ex}`);
      GMLog("[ MCBBS Loader ] 所有插件均未加载，请到管理页面修复依赖关系错误");
    }
  });
})();
