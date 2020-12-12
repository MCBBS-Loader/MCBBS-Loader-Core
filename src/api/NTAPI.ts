import {
  getWindowProperty,
  GMDownload,
  GMGetValue,
  GMNotification,
  GMSetValue,
  setWindowProperty,
} from "../libs/usfunc";
import $ from "jquery";
import { closepop, popinfo } from "../libs/popinfo";
import { Permission, Ticket, PermissionDenied, PermissionManager} from "../libs/native";
import { checkedCall, getGM, markScriptDirty, getMods } from "../libs/codeload"
const ML_VERSION = 1;
var MCBBS = {};
// 通知相关
Object.defineProperty(MCBBS, "sysNotification", {get: () => GMNotification});

// 显示相关
Object.defineProperty(MCBBS, "popStatus", {get: () => popinfo});
Object.defineProperty(MCBBS, "closeStatus", {get: () => closepop});

// 存储相关
Object.defineProperty(MCBBS, "storeData", {get: () => storeData});
Object.defineProperty(MCBBS, "getData", {get: () => getData});

// jQuery
Object.defineProperty(MCBBS, "$", $);

// 模块导入导出
setWindowProperty("MIDT", {});
Object.defineProperty(MCBBS, "export_", {get: () => moduleExport});
Object.defineProperty(MCBBS, "import_", {get: () => moduleImport});

// 下载部分
Object.defineProperty(MCBBS, "download", {get: () => GMDownload});

// 版本号部分
Object.defineProperty(MCBBS, "getAPIVersion", {get: () => getAPIVersion});

// 权限控制
Object.defineProperty(MCBBS, "Permission", {get: () => Permission});
Object.defineProperty(MCBBS, "Ticket", {get: () => Ticket});
Object.defineProperty(MCBBS, "PermissionDenied", {get: () => PermissionDenied});
Object.defineProperty(MCBBS, "checkedCall", {get: () => checkedCall});
Object.defineProperty(MCBBS, "PermissionManager", {
  get: () => {
    PermissionManager.consoleTicket();
    return PermissionManager;
  }
});
Object.defineProperty(MCBBS, "getGM", {get: () => getGM});
Object.defineProperty(MCBBS, "getMods", {get: () => getMods});
Object.defineProperty(MCBBS, "markScriptDirty", {get: () => markScriptDirty});

// 写入窗口
function initAPI() {
  setWindowProperty("MCBBS", MCBBS);
}
// 实现部分
function getAPIVersion() {
  return ML_VERSION;
}

function moduleExport(idIn: string, obj: any) {
  setWindowProperty(`module-export-${idIn}`, obj);
  notifyExport(idIn);
}
function moduleImport(id: string, callback: (arg: any) => void) {
  if (getWindowProperty(`module-export-${id}`)) {
    callback(getWindowProperty(`module-export-${id}`));
  } else {
    var origin = getWindowProperty("MIDT")[id];
    if (origin) {
      var nc = (obj: any) => {
        origin(obj);
        callback(obj);
      };
      getWindowProperty("MIDT")[id] = nc;
    } else {
      getWindowProperty("MIDT")[id] = callback;
    }
  }
}

function notifyExport(id: string) {
  for (var x in getWindowProperty("MIDT")) {
    if (x == id) {
      getWindowProperty("MIDT")[x](getWindowProperty(`module-export-${id}`));
      var m = getWindowProperty("MIDT");
      delete m[x];
      setWindowProperty("MIDT", m);
    }
  }
}

function storeData(tag: string, data: any): void {
  GMSetValue("data-" + tag, data);
}
function getData(tag: string, defaultVal: any): any {
  return GMGetValue("data-" + tag, defaultVal);
}
export { initAPI, getAPIVersion };
