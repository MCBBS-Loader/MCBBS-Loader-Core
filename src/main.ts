import { installFromUrl, mountCode } from "./libs/codeload";
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
import { setup } from "./libs/setupbattery";
import { getProperty, setProperty } from "./libs/native";
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
  jQuery(() => {
    manager.createBtn();
    manager.createMenu();
    if (String(window.location) === "https://www.mcbbs.net/home.php?mod=spacecp&bbsmod=manager") {
      manager.dumpManager();
    }
    var fixRaw = (raw:any) => {
      raw.before_count = 0;
      raw.after_count = 0;
      raw.before_head = null;
      raw.after_head = null;
      raw.done = false;
      return raw;
    };
    var dependencies = new Map<string, object>();
    var stack: object[] = [];
    var sortedList = [];
    for (var [name, enabled] of Object.entries(GMGetValue("loader.all", {}))) {
      if (enabled) {
        dependencies.set(name, fixRaw(JSON.parse(GMGetValue("depend-" + name, "{}"))));
        checkUpdate(GMGetValue("meta-" + name, ""), (state) => {
          if (state != "latest") {
            installFromUrl(state);
          }
        });
      }
    }
    try{// 排个序
      // 邻接表
      var insert = (before:any, after:any) => {
        before.before_count++;
        after.after_count++;
        var node = [before, after, before.before_head, after.after_head, null, null];
        node[3][5] = node[2][4] = node;
        after.after_head = before.before_head = node;
      }
      var unlink = (node:any) => {
        node[3][5] = node[5];
        node[2][4] = node[4];
        node[5][3] = node[3];
        node[4][2] = node[2];
        if(node === node[1].after_head){
          node[1].after_head = node[3];
        }
        if(node === node[0].before_head){
          node[0].before_head = node[2];
        }
        node[1].after_count--;
        node[0].before_count--;
        if(node[0].before_count == 0){
          stack.push(node[0]);
        }
      }
      dependencies.forEach((v, k) => {
        var depend = getProperty(v, "depend");
        if(depend instanceof Array){
          depend.forEach((e, i) => {
            if(!dependencies.get(e))
              throw "依赖关系无解";
          });
        }
        var before = getProperty(v, "before");
        if(before instanceof Array){
          before.forEach((e, i) => {
            var target = dependencies.get(e);
            if(target){
              insert(v, e);
            }
          });
        }
        var after = getProperty(v, "after");
        if(after instanceof Array){
          after.forEach((e, i) => {
            var target = dependencies.get(e);
            if(target){
              insert(e, v);
            }
          });
        }
      });
      dependencies.forEach((v, k) => {
        if((v as any).before_head === null){
          stack.push(v);
        }
      });
      while(stack.length){
        var process = stack.pop();
        sortedList.push(process);
        // 是undefined个屁，垃圾Typescript编译器
        process.done = true;
        while(process.after_head){
          unlink(process.after_head)
        }
      }
      dependencies.forEach((v, k) => {
        if(!(v as any).done){
          throw "依赖关系无解";
        }
      });
    }catch(ex){

    }
    mountCode(name, GMGetValue("code-" + name, "") || "");
  });
})();
