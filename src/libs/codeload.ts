import { getAPIVersion } from "../api/STDAPI";
import { getAPIToken } from "./encrypt";
import { setProperty } from "./native";
import { GMDeleteValue, GMGetValue, GMSetValue } from "./usfunc";
import manager from "./manager";
import { IMG_MCBBS } from "./static";
import { getCrossOriginData } from "./crossorigin";
import { showPopper } from "../craftmcbbs/craft-ui";
import { DOMUtils, select, trim } from "./domutils";

// 解析 GID
class GIDURL {
  static NIL = new GIDURL("", "", "", "", "", null);
  service: string;
  version: string;
  repo: string;
  file: string;
  provider: string;

  constructor(service: string, version: string, repo: string, file: string, provider: string,
    root: GIDURL | null = GIDURL.NIL) {
    this.service = service == '~' ? root!.service : service;
    this.version = version == '~' ? root!.version : version;
    this.repo = repo == '~' ? root!.repo : repo;
    this.file = file == '~' ? root!.file : file;
    this.provider = provider == '~' ? root!.provider : provider;
  }

  static fromString(str: string, root: GIDURL = GIDURL.NIL): GIDURL {
    let strs = str.split(":");
    switch (strs.length) {
      case 1:
        return new GIDURL("github", "", str, str, "MCBBS-Loader", root);
      case 2:
        return new GIDURL("github", "", strs[1], strs[1], strs[0], root);
      case 3:
        return new GIDURL("github", "", strs[1], strs[2], strs[0], root);
      case 4:
        return new GIDURL("github", strs[3], strs[1], strs[2], strs[0], root);
      case 5:
        return new GIDURL(strs[0], strs[4], strs[2], strs[3], strs[1], root);
      default:
        return GIDURL.NIL;
    }
  }

  getAsURL(extname: string = ".js"): string {
    return this.service == "github" ?
      `https://cdn.jsdelivr.net/gh/${this.provider}/` +
      `${this.repo}${this.version ? '@' : ''}${this.version}/${this.file}${extname}` :
      this.service == "gitee" ?
        `https://gitee.com/${this.provider}/${this.repo}/raw/${this.version}/${this.file}${extname}` : "";
  }

  asString(): string {
    return [this.service, this.provider, this.repo, this.file, this.version].join(':');
  }
}

const STRING_API_VERSION = String(getAPIVersion());
let dirty: boolean = false,
  globalDependencyError: string | null = null, globalTmpDisabled: string[] | null = null;
function getTmpDisabled(): string[] {
  return globalTmpDisabled == null ? globalTmpDisabled = GMGetValue("loader.tmpDisabled", []) : globalTmpDisabled;
}

function getDependencyError(): string {
  return globalDependencyError == null ?
    globalDependencyError = GMGetValue("loader.dependencyError", "") : globalDependencyError;
}

function isDependencySolved(): boolean {
  return !getDependencyError().length;
}

function resortDependency(): string | string[] {
  return resortDependencyInternal(GMGetValue("loader.all", {}), "", []);
}

function resortDependencyInternal(all: any, dependencyError: string, tmpDisabled: string[]): string[] {
  // 哨兵节点，用于标记链表末尾，只写不读，初始化全undefined
  const mapNil = {};
  let fixRaw = (id: string, raw: any) => {
    raw.beforeHead = mapNil;
    raw.afterHead = mapNil;
    raw.id = id;
    return raw;
  };
  // 邻接表
  let dependencies = new Map<string, object>();
  let stack: any[] = [];
  let sortedList = [];
  let toDisable: Set<string> = new Set();

  for (let [id, enabled] of Object.entries(all)) {
    if (enabled)
      dependencies.set(id, fixRaw(id, JSON.parse(GMGetValue("depend-" + id, "{}"))));
    if ((GMGetValue("meta-" + id, {}).apiVersion || getAPIVersion()) != getAPIVersion()) {
      deleteModule(id, () => {
        console.log("[MCBBS Loader] 由于 API 版本不兼容，移除了 ID 为 " + id + " 的脚本。\n如有需要，你可以重新安装。");
        showPopper("[MCBBS Loader] 由于 API 版本不兼容，移除了 ID 为 " + id + " 的脚本。\n如有需要，你可以重新安装。");
      });
    }
  }
  // 排个序
  let insert = (before: any, after: any) => {
    let node: any = {
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
  let unlink = (node: any) => {
    node.afterNext.afterPrev = node.afterPrev;
    node.beforeNext.beforePrev = node.beforePrev;
    node.afterPrev.afterNext = node.afterNext;
    node.beforePrev.beforeNext = node.beforeNext;
    if (node === node.after.afterHead)
      node.after.afterHead = node.afterNext;
    if (node === node.before.beforeHead)
      node.before.beforeHead = node.beforeNext;
    // 如果它不需要在某个插件之后加载，那下一个就加载它
    if (mapNil === node.after.afterHead)
      stack.push(node.after);
  };
  dependencies.forEach((v: any, k) => {
    let depend = v.depend;
    if (depend instanceof Array) {
      depend.forEach(e => {
        if (!dependencies.get(e)) {
          dependencyError += `${k}依赖${e}，但是后者未安装或未启用。\n`;
          toDisable.add(k);
        }
      });
    }
    let before = v.before;
    if (before instanceof Array) {
      before.forEach((e) => {
        let target = dependencies.get(e);
        if (target)
          insert(v, target);
      });
    }
    let after = v.after;
    if (after instanceof Array) {
      after.forEach((e) => {
        let target = dependencies.get(e);
        if (target)
          insert(target, v);
      });
    }
  });
  dependencies.forEach((v: any) => {
    if (v.afterHead === mapNil)
      stack.push(v);
  });
  while (stack.length) {
    let process = stack.pop() as any;
    sortedList.push(process.id);
    // 加个排序完成标记，解除其他插件需要在本插件之后加载的限制
    while (mapNil != process.beforeHead)
      unlink(process.beforeHead);
  }
  // 如果排序已经结束了还有插件没有进入到序列里来，那么排序一定无解，但是相同一个模块的错误只需要输出一次
  dependencies.forEach(v => {
    if ((v as any).beforeHead != mapNil) {
      toDisable.add((v as any).id);
      dependencyError += (v as any).id + "要求在";
      let node: any = (v as any).beforeHead;
      while (node != mapNil) {
        dependencyError += node.after.id + (node.beforeNext === mapNil ? "" : ",");
        node = node.beforeNext;
      }
      dependencyError += "之前加载，然而此要求无法满足。\n";
    }
  });

  let toSerialize: any[] = [];
  toDisable.forEach((v) => {
    toSerialize.push(v);
    delete all[v];
  });
  if (toSerialize.length) {
    dependencyError += "已临时停用" + toSerialize.toString() + "\n";
    return resortDependencyInternal(all, dependencyError, tmpDisabled.concat(toSerialize));
  } else {
    globalTmpDisabled = tmpDisabled;
    globalDependencyError = dependencyError;
    GMSetValue("loader.sortedModuleList", sortedList);
    GMSetValue("loader.dependencyError", dependencyError);
    GMSetValue("loader.tmpDisabled", tmpDisabled);
    return sortedList;
  };
}
// 验证一个id是否正确
function verifyId(id: string): boolean {
  return /^[0-9|a-z|A-Z|\.|_]+$/.test(id);// 好了现在什么符号都不让用了
}
// 安装一个模块
function addModule(code: string, gid: GIDURL = GIDURL.NIL): Map<string, string> | string {
  let isModuleRegex = /\/\*( )*MCBBS[ -]*Module/;
  let ccode = code.trim();
  if (!isModuleRegex.test(ccode))
    return "这不是一个模块";
  let dataMap = new Map<string, string>();
  parseMeta(ccode, dataMap);
  let flitBlank = (strarr: string[]): string[] => {
    let newarr: string[] = [];
    for (let str of strarr) {
      let target = str.trim();
      if (target.length)
        newarr.push(target);
    }
    return newarr;
  };
  let depend: string = dataMap.get("depend") || "",
    before: string,
    after: string,
    apiVersion: string | undefined,
    id: string | undefined = dataMap.get("id");
  if (id === undefined)
    return "未提供 id 数据值"
  else if (!verifyId(id))
    return "不合要求的 id";
  let ins_depend: any[] = [], deplocMap: any = {};
  for (let d of depend.split(",")) {
    let dep = d.trim();
    if (!dep.length)
      continue;
    if (dep.includes("->")) {
      let parse = /^([0-9|a-z|A-Z|\.|_]+) -> ([0-9|a-z|A-Z|\.|_|:|/|%|@|-]+)$/.exec(dep);
      if (!parse || parse.length != 3)
        return "依赖地址编写格式错误";
      ins_depend.push(parse[1]);
      if (!deplocMap[parse[1]])
        deplocMap[parse[1]] = [];
      deplocMap[parse[1]].push(parse[2]);
    } else {
      ins_depend.push(dep);
    }
  }

  depend = ins_depend.join(",");
  let obj: object = {
    id: id,
    permissions: dataMap.get("permissions") || "",
    name: dataMap.get("name") || dataMap.get("id"),
    author: dataMap.get("author") || "Someone",
    icon: dataMap.get("icon") || IMG_MCBBS,
    depend: depend,
    before: (before = dataMap.get("before") || ""),
    after: (after = dataMap.get("after") || ""),
    description: dataMap.get("description") || "No description provided.",
    updateURL: dataMap.get("updateURL"),
    apiVersion: (apiVersion = dataMap.get("apiVersion")),
    version: dataMap.get("version"),
    gid: gid != GIDURL.NIL ? gid.asString() : dataMap.get("gid")
  };
  if ((apiVersion || STRING_API_VERSION) != STRING_API_VERSION) {
    return "不支持的 API 版本：" + apiVersion;
  }
  if (regMeta(id, obj)) {
    GMSetValue("code-" + id, ccode);
    GMSetValue(
      "depend-" + id,
      JSON.stringify({
        depend: ins_depend,
        before: flitBlank(before.split(",")),
        after: flitBlank(after.split(",")),
      })
    );
    markDirty();
    let all = GMGetValue("loader.all", {});
    for (let dep of ins_depend) {
      if (all[dep] == undefined) {
        let tryInstall = () => {
          if (deplocMap[dep] && !deplocMap[dep].pending && deplocMap[dep].length) {
            deplocMap[dep].pending = true;
            let loc = deplocMap[dep].shift();
            if (/^((file|https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/g.test(loc)) {
              installFromUrl(loc, (st: any) => {
                manager.onInstall(st);
                deplocMap[dep].pending = false;
              }, (reason: any) => {
                manager.onFailure(reason);
                deplocMap[dep].pending = false;
                tryInstall();
              });
            } else {
              installFromGID(GIDURL.fromString(loc, gid), (st: any) => {
                manager.onInstall(st);
                deplocMap[dep].pending = false;
              }, (reason: any) => {
                manager.onFailure(reason);
                deplocMap[dep].pending = false;
                tryInstall();
              });
            }
          }
        }
        tryInstall();
      }
    }
    return dataMap;
  } else {
    return "未知错误";
  }
}

// 解析头部信息
function parseMeta(code: string, map: Map<string, string>): void {
  let extractMetaRegex = /(?<=\/\*( )*MCBBS[ -]*Module)[\s\S]*?(?=\*\/)/;
  let metaarr = code.match(extractMetaRegex) || [];
  let metas = metaarr[0] || "";
  metas = metas.replace(/\\\n/g, "");
  let allmeta = metas.split("\n");
  let isItemRegex = /.+?\=.*/;
  let kRegex = /.+?(?=\=)/;
  let vRegex = /(?<=\=).*/;
  for (let l of allmeta) {
    if (isItemRegex.test(trim(l))) {
      let k = (trim(l).match(kRegex) || [])[0] || "";
      let v = (trim(l).match(vRegex) || [])[0] || "";
      map.set(trim(k), trim(v));
    }
  }
}
// 注册元数据
function regMeta(id: string, meta: any): boolean {
  GMSetValue("meta-" + id, meta);
  let all = GMGetValue("loader.all", {});
  try {
    setProperty(all, id, true);
    GMSetValue("loader.all", all);
    return true;
  } catch {
    return false;
  }
}
// 加载代码
function mountCode(id: string, code: string): void {
  DOMUtils.load(() => {
    select("body").append(
      `<script id='code-${id}' onload='this.remove();'>
        (function(){
          let MCBBS = Object.freeze(window.forkAPI_${getAPIToken()}("${id}"));
          ${code}
        })();
      </script>`
    );
  });
}
// 卸载代码
function unmountCode(id: string): void {
  DOMUtils.load(() => {
    select(`#code-${id}`).remove();
  });
}
// 删除模块
function deleteModule(id: string, callback: () => void): void {
  GMDeleteValue("meta-" + id);
  GMDeleteValue("code-" + id);
  GMDeleteValue("depend-" + id);
  let obj = GMGetValue("loader.all", {});
  setProperty(obj, id, undefined);
  GMSetValue("loader.all", obj);
  markDirty();
  callback();
}
// 使用统一 ID 安装
function installFromGID(gid: GIDURL, onsuccess: (st: Map<string, string>) => void, onerror: (reason: string) => void) {
  installFromUrl(gid.getAsURL(), onsuccess, onerror, gid);
}
// 从URL安装
function installFromUrl(
  url: string,
  onsuccess: (st: Map<string, string>) => void = () => { },
  onerror: (reason: string) => void = () => { },
  gid: GIDURL = GIDURL.NIL
) {
  getCrossOriginData(url, () => onerror("安装失败，网络请求失败"), data => {
    let st = addModule(data, gid);
    if (typeof st == "string")
      onerror(st);
    else
      onsuccess(st);
    resortDependency();
  });
}
// 判断是否操作过
function isDirty() {
  return dirty;
}
function markDirty() {
  dirty = true;
}
function coreModEval(code: string) {
  return new Promise((resolve, reject) => {
    try {
      eval(code);
      resolve(0);
    } catch (e) {
      reject(e);
    }
  });
}
export {
  GIDURL,
  addModule,
  mountCode,
  deleteModule,
  unmountCode,
  installFromUrl,
  parseMeta,
  isDirty,
  markDirty,
  coreModEval,
  resortDependency,
  getTmpDisabled,
  getDependencyError,
  isDependencySolved,
  installFromGID,
};