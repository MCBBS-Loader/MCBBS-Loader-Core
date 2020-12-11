import $ from "jquery";
import { setProperty } from "./native";
import { GMDeleteValue, GMGetValue, GMSetValue } from "./usfunc";
// 安装一个模块
function addModule(code: string): Map<string, string> | undefined {
  if (!$.trim(code).startsWith("// MCBBS-Module")) {
    return undefined;
  } else {
    var ccode = $.trim(code);
    if (ccode.split("// -MCBBS-Module").length != 2) {
      return undefined;
    } else {
      var meta = ccode.split("// -MCBBS-Module")[0];
      var lines = meta.split("// MCBBS-Module")[1].split("\n");
      var dataMap = new Map<string, string>();
      for (var l of lines) {
        parseItem(l, dataMap);
      }
      var obj = {}, depend:string, before:string, after:string;
      setProperty(obj, "id", dataMap.get("id") || "loader.nameless");
      setProperty(obj, "name", dataMap.get("name") || "Nameless");
      setProperty(obj, "author", dataMap.get("author") || "Someone");
      setProperty(obj, "icon", dataMap.get("icon"));
      setProperty(obj, "depend", depend = dataMap.get("depend") || "");
      setProperty(obj, "before", before = dataMap.get("before") || "");
      setProperty(obj, "after", after = dataMap.get("after") || "");
      setProperty(
        obj,
        "description",
        dataMap.get("description") || "A nameless module."
      );
      setProperty(obj, "update", dataMap.get("update"));
      setProperty(obj, "version", dataMap.get("version") || "1.0.0");
      setProperty(obj, "update", dataMap.get("update"));
      var succ = regMeta(dataMap.get("id") || "loader.nameless", obj);
      var flitBlank = (strarr:string[]):string[] => {
        var newarr:string[] = [];
        for(var str of strarr) {
          var target:string = "";
          for(var char of str){
            if(char != " " && char != '\t') {
              target += char;
            }
          }
          if(target.length){
            newarr.push(target);
          }
        }
        return newarr;
      }
      if (succ) {
        GMSetValue(
          "code-" + (dataMap.get("id") || "loader.nameless"),
          ccode.split("// -MCBBS-Module")[1]
        );
        GMSetValue(
          "depend-" + (dataMap.get("id") || "loader.nameless"),
          JSON.stringify({
            depend: flitBlank(depend.split(",")),
            before: flitBlank(before.split(",")),
            after: flitBlank(after.split(","))
          })
        );
        return dataMap;
      } else {
        return undefined;
      }
    }
  }
}
// 解析头部信息
function parseItem(item: string, map: Map<string, string>): boolean {
  var isItemRegex = /\/\/( )?@[a-z]* .*/;
  if (isItemRegex.test(item)) {
    var keyRegex = /(?<=\/\/( )?@)[a-z]*(?= .*)/;
    var valRegex = /(?<=\/\/( )?@[a-z]* ).*/;
    map.set(
      (item.match(keyRegex) || [])[0] || "",
      (item.match(valRegex) || [])[0] || ""
    );
    return true;
  }
  return false;
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
      `<script id='code-${id}'>(function(){${code}})()</script>`
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
  callback();
}
// 从URL安装
function installFromUrl(url: string) {
  try {
    $.get(url, (dataIn) => {
      try {
        var data = dataIn.toString();
        if (typeof data == "string") {
          addModule(data);
        }
      } catch {}
    });
  } catch {}
}
export {
  addModule,
  mountCode,
  deleteModule,
  unmountCode,
  parseItem,
  installFromUrl,
};
