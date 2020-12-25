import $ from "jquery";
import { getAPIVersion, setMods } from "../api/NTAPI";
import { getAPIToken } from "./encrypt";
import { setProperty } from "./native";
import { GMDeleteValue, GMGetValue, GMSetValue } from "./usfunc";
import manager from "./manager";
const STRING_API_VERSION = String(getAPIVersion());
var dirty: boolean = false,
  dependencyError: string = "";
function getDependencyError(): string {
  return dependencyError;
}

function setDependencyError(error: string) {
  dependencyError = error;
}

function isDependencySolved(): boolean {
  return !dependencyError.length;
}

function resortDependency() {
  // 哨兵节点，用于标记链表末尾，只写不读，初始化全undefined
  const mapNil = {};
  dependencyError = "";
  var fixRaw = (id: string, raw: any) => {
    raw.beforeHead = mapNil;
    raw.afterHead = mapNil;
    raw.id = id;
    return raw;
  };
  // 邻接表
  var dependencies = new Map<string, object>();
  var stack: any[] = [];
  var sortedList = [];
  var all = GMGetValue("loader.all", {});
  setMods(all);
  for (var [id, enabled] of Object.entries(all)) {
    if (enabled) {
      dependencies.set(
        id,
        fixRaw(id, JSON.parse(GMGetValue("depend-" + id, "{}")))
      );
    }
    if (
      (GMGetValue("meta-" + id, {}).apiVersion || getAPIVersion()) !=
      getAPIVersion()
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
  dependencies.forEach((v: any, k) => {
    var depend = v.depend;
    if (depend instanceof Array) {
      depend.forEach((e) => {
        if (!dependencies.get(e)) {
          dependencyError += `${k}依赖${e}，但是后者未安装或未启用。\n`;
        }
      });
    }
    var before = v.before;
    if (before instanceof Array) {
      before.forEach((e) => {
        var target = dependencies.get(e);
        if (target) {
          insert(v, target);
        }
      });
    }
    var after = v.after;
    if (after instanceof Array) {
      after.forEach((e) => {
        var target = dependencies.get(e);
        if (target) {
          insert(target, v);
        }
      });
    }
  });
  dependencies.forEach(v => {
    if ((v as any).afterHead === mapNil) {
      stack.push(v);
    }
  });
  while (stack.length) {
    var process = stack.pop() as any;
    sortedList.push(process.id);
    // 加个排序完成标记，解除其他插件需要在本插件之后加载的限制
    while (mapNil != process.beforeHead) {
      unlink(process.beforeHead);
    }
  }
  // 如果排序已经结束了还有插件没有进入到序列里来，那么排序一定无解，但是相同一个模块的错误只需要输出一次
  dependencies.forEach(v => {
    if ((v as any).beforeHead != mapNil) {
      dependencyError += (v as any).id + "要求在";
      var node: any = (v as any).beforeHead;
      while(node != mapNil) {
        dependencyError += node.after.id + (node.beforeNext === mapNil ? "" : ",");
        node = node.beforeNext;
      }
      dependencyError += "之前加载，然而此要求无法满足。\n"
    }
  });
  GMSetValue("sorted-modules-list", isDependencySolved() ? sortedList : dependencyError);
}
const allowedChars =
    "1234567890!@#$%^&*()qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM_.",
  charAllowed: any = {};
for (var c of allowedChars) {
  charAllowed[c] = true;
}
// 验证一个id是否正确
function verifyId(id: string): boolean {
  for (var c of id) {
    if (!charAllowed[c]) {
      return false;
    }
  }
  return true;
}
// 安装一个模块
function addModule(code: string): Map<string, string> | string {
  var isModuleRegex = /\/\*( )*MCBBS[ -]*Module/;
  var ccode = code.trim();
  if (!isModuleRegex.test(ccode)) {
    return "这不是一个模块";
  } else {
    var dataMap = new Map<string, string>();
    parseMeta(ccode, dataMap);
    var flitBlank = (strarr: string[]): string[] => {
      var newarr: string[] = [];
      for (var str of strarr) {
        var target = str.trim();
        if (target.length) {
          newarr.push(target);
        }
      }
      return newarr;
    };
    var depend: string = dataMap.get("depend") || "",
      before: string,
      after: string,
      apiVersion: string | undefined,
      id: string | undefined = dataMap.get("id");
    if (id === undefined) {
      return "未提供 id 数据值";
    }
    if (!verifyId(id)) {
      return "不合要求的 id";
    }
    var ins_depend: any[] = [];
    for (var d of depend.split(",")) {
      var dep = d.trim();
      if (!dep.length) {
        continue;
      }
      var hasURLRegex = /.+?\-\>((file|https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/;
      if (hasURLRegex.test(dep)) {
        var [i, u] = dep.split("->");
        if (!GMGetValue(`depend-${i}`, "{}")) {
          installFromUrl(u);
        }
        ins_depend.push(i);
      } else {
        ins_depend.push(dep);
      }
    }
    depend = ins_depend.join(",");
    var obj: object = {
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
      return dataMap;
    } else {
      return "未知错误";
    }
  }
}
// 解析头部信息
function parseMeta(code: string, map: Map<string, string>): void {
  var extractMetaRegex = /(?<=\/\*( )*MCBBS[ -]*Module)[\s\S]*?(?=\*\/)/;
  var metaarr = code.match(extractMetaRegex) || [];
  var metas = metaarr[0] || "";
  metas = metas.replace(/\\\n/g, "");
  var allmeta = metas.split("\n");
  var isItemRegex = /.+?\=.*/;
  var kRegex = /.+?(?=\=)/;
  var vRegex = /(?<=\=).*/;
  for (var l of allmeta) {
    if (isItemRegex.test($.trim(l))) {
      var k = ($.trim(l).match(kRegex) || [])[0] || "";
      var v = ($.trim(l).match(vRegex) || [])[0] || "";
      map.set($.trim(k), $.trim(v));
    }
  }
}
// 注册元数据
function regMeta(id: string, meta: any): boolean {
  GMSetValue("meta-" + id, meta);
  var all = GMGetValue("loader.all", {});
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
  $(() => {
    $("body").append(
      `<script id='code-${id}' onload='this.parentNode.removeChild(this);'>(function(){var MCBBS = Object.freeze(window.forkAPI_${getAPIToken()}("${id}"));\n${code}\nvar _sele = document.getElementById('code-${id}');_sele.parentNode.removeChild(_sele);})()</script>`
    );
  });
}
// 卸载代码
function unmountCode(id: string): void {
  $(() => {
    $(`#code-${id}`).remove();
  });
}
// 删除模块
function deleteModule(id: string, callback: () => void): void {
  GMDeleteValue("meta-" + id);
  GMDeleteValue("code-" + id);
  GMDeleteValue("depend-" + id);
  var obj = GMGetValue("loader.all", {});
  setProperty(obj, id, undefined);
  GMSetValue("loader.all", obj);
  markDirty();
  callback();
}
// 从URL安装
function installFromUrl(
  url: string,
  onsuccess?: () => void,
  onerror?: () => void
) {
  try {
    $.get(url, (dataIn) => {
      try {
        var data = dataIn.toString();
        if (typeof data === "string") {
          addModule(data);
          if (onsuccess) {
            onsuccess();
          }
          resortDependency();
          if (/bbsmod\=manager/i.test(String(window.location.search))) {
            manager.dumpManager();
          }
        }
      } catch {
        if (onerror) {
          onerror();
        }
      }
    }).fail(() => {
      if (onerror) {
        onerror();
      }
    });
  } catch {}
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
  setDependencyError,
  getDependencyError,
  isDependencySolved,
};
const IMG_MCBBS =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAgAElEQVR4Ae2d76p2WXbVcwX5UCb9x3RVAlVU0bakaVuwvwiiEBISENMiQYh20xqDTTSKJDHglwYxQuInL6AFDXonwZs6Mosa5XhHzznXXPvZ5937nDMCD/PfWmuvPfaav+xz3qfr/NzP+f+sgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBayAFbACVsAKWAErYAWsgBWwAlbAClgBK2AFrIAVsAJWwApYAStgBd6SAt/69KOn+Lyle/a9WgEr8MIUAKjUvrDb8HatgBV4zQoooKr4NWvge7MCVuDmClRgWuVvflvenhWwAq9Jge9957Mn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";
