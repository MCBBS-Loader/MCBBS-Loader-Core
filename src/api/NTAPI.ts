import {
  getWindowProperty,
  GMDownload,
  GMGetValue,
  GMNotification,
  GMSetValue,
  setWindowProperty,
} from "../libs/usfunc";
import $ from "jquery";
import { hasPermission } from "../libs/permissions";
import { getGM } from "../libs/native";
import { coreModEval } from "../libs/codeload";
import configpage from "../libs/configpage";
import { info } from "../libs/popinfo2";

const ML_VERSION = 1;
var all: any = GMGetValue("loader.all", {});

function forkAPI(id: string) {
  return new MCBBSAPI(id);
}

// 模块导入导出
setWindowProperty("MIDT", {});

class MCBBSAPI {
  private id: string;
  public local: Object = {};

  constructor(id: string) {
    this.id = id;
    if (hasPermission(id, "loader:core")) {
      this.eval = coreModEval;
      this.GM = getGM();
    } else {
      this.eval = undefined;
      this.GM = undefined;
    }
  }

  public getAPIVersion = getAPIVersion;
  public download = GMDownload;
  public export_ = (obj: any) => {
    moduleExport(this.id, obj);
  };
  public import_ = moduleImport;
  public $ = $;

  public storeData(k: string, v: any) {
    storeData(this.id + "-" + k, v);
  }

  public createConfig(stgid: string, name: string, type: string, desc: string,
      check: (arg: string) => string | undefined = (arg) => undefined) {
    var map = new Map();
    map.set("storageId", stgid);
    map.set("name", name);
    map.set("desc", desc);
    map.set("id", this.id);
    map.set("type", type);
    map.set("check", check);
    configpage.createConfigItem(map);
  }

  public getConfigVal(stgid: string, dval?: any) {
    return configpage.getConfigVal(this.id, stgid, dval); // 之前的检查方法会造成默认值为false或者""时失败
  }

  public setConfigVal(stgid: string, value: any) {
    configpage.setConfigVal(this.id, stgid, value);
  }

  public getData(k: string, dv: any) {
    return getData(this.id + "-" + k, dv);
  }

  public mountJS(src: string) {
    $("head").append(`<script src='${src}'></script>`);
  }

  public popInfo = (msg: string) => {
    info(`[ ${this.id} ] ` + msg);
  };

  public isModRunning(id: string) {
    return !!GMGetValue("all_modules")[id];
  }

  public sysNotification = GMNotification;
  public GM;
  public eval;
}

// 实现部分
function getAPIVersion() {
  return ML_VERSION;
}

function moduleExport(idIn: string, obj: any) {
  setWindowProperty(`module-export-${idIn}`, obj);
  notifyExport(idIn);
}

function moduleImport(id: string, callback: (arg: any) => void): boolean {
  if (getWindowProperty(`module-export-${id}`)) {
    callback(getWindowProperty(`module-export-${id}`));
  } else {
    var origin = getWindowProperty("MIDT")[id];
    if (origin) {
      getWindowProperty("MIDT")[id] = (obj: any) => {
        origin(obj);
        callback(obj);
      };
    } else {
      getWindowProperty("MIDT")[id] = callback;
    }
  }
  return !!all[id]; // 让被调用者知道是否import到
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

export { forkAPI, getAPIVersion };
