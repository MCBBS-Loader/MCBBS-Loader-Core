import {
  getWindowProperty,
  GMGetValue,
  GMSetValue,
  GMXmlhttpRequest,
  setWindowProperty,
} from "../libs/usfunc";
import $ from "jquery";
import { hasPermission } from "../libs/permissions";
import { getGM } from "../libs/native";
import { coreModEval, GIDURL } from "../libs/codeload";
import configpage from "../libs/configpage";
import { info } from "../libs/popinfo2";
import { LoaderEvent } from "./STDEVT";

const ML_VERSION = 1;
const GM: any = getGM();
var all: any = GMGetValue("loader.all", {});

function forkAPI(id: string) {
  return new MCBBSAPI(id);
}

function assert(value: any): void {
  if(!value) {
    throw new Error("Assertion failed!");
  }
}

// 模块导入导出
setWindowProperty("MIDT", {});

class MCBBSAPI {
  private id: string;
  public local: Object = {};
  public LoaderEvent = LoaderEvent;

  constructor(id: string) {
    this.id = id;
    let gid = GMGetValue("loader.all").gid;
    this.gid = gid ? Object.freeze(GIDURL.fromString(gid)) : null;
    if (hasPermission(id, "loader:core")) {
      this.eval = coreModEval;
      this.GM = getGM();
    } else {
      this.eval = undefined;
      this.GM = undefined;
    }
  }

  public getAPIVersion = getAPIVersion;
  public download = GM.GM_download;
  public export_ = (obj: any) => {
    moduleExport(this.id, obj);
  };
  public import_ = moduleImport;
  public $ = $;

  // Polyfills
  public GM_download = GM.GM_download;
  public GM_setValue = this.storeData;
  public GM_getValue = this.getData;

  public storeData(k: string, v: any) {
    storeData(this.id + "-" + k, v);
  }

  public createConfig(
    stgid: string,
    name: string,
    type: string,
    desc: string,
    check: (arg: string) => string | undefined = (arg) => undefined
  ) {
    assert(typeof stgid == "string");
    assert(typeof name == "string");
    assert(typeof type == "string");
    assert(typeof desc == "string");
    assert(typeof check == "function");
    configpage.createConfigItem(this.id, stgid, name, type, desc, check);
  }

  public getConfigVal(stgid: string, dval?: any) {
    assert(typeof stgid == "string");
    return configpage.getConfigVal(this.id, stgid, dval); // 之前的检查方法会造成默认值为false或者""时失败
  }

  public setConfigVal(stgid: string, value: any) {
    assert(typeof stgid == "string");
    configpage.setConfigVal(this.id, stgid, value);
  }

  public getData(k: string, dv: any) {
    assert(typeof k == "string");
    return getData(this.id + "-" + k, dv);
  }

  public mountJS(src: string) {
    assert(typeof src == "string");
    $("head").append(`<script src='${src}'></script>`);
  }

  public popInfo(msg: string) {
    assert(typeof msg == "string");
    info(`[ ${this.id} ] ` + msg);
  }

  public isModRunning(id: string) {
    assert(typeof id == "string");
    return GMGetValue("loader.sortedModuleList").indexOf(id) >= 0;
  }

  public crossOriginRequest(details: any): {abort: () => void} {
    return GMXmlhttpRequest(details);
  }

  public sysNotification = GM.GM_notification;
  public GM;
  public eval;
  public GIDURL = GIDURL;
  public gid: GIDURL | null;
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
  return GMGetValue("loader.sortedModuleList").indexOf(id) >= 0; // 让被调用者知道是否import到
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
