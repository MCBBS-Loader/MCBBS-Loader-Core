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
const ML_VERSION = 1;
function forkAPI(id: string) {
  return new MCBBSAPI(id);
}

// 模块导入导出
setWindowProperty("MIDT", {});

class MCBBSAPI {
  private id: string;
  constructor(id: string) {
    this.id = id;
  }
  public getAPIVersion = getAPIVersion;
  public download = GMDownload;
  public export_ = moduleExport;
  public import_ = moduleImport;
  public $ = $;
  public storeData(k: string, v: any) {
    storeData(this.id + "-" + k, v);
  }
  public getData(k: string, dv: any) {
    return getData(this.id + "-" + k, dv);
  }
  public popStatus = popinfo;
  public closeStatus = closepop;
  public sysNotification = GMNotification;
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
export { forkAPI, getAPIVersion };
