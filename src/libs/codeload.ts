import $ from "jquery";
import { setProperty } from "./native";
import { GMDeleteValue, GMGetValue, GMSetValue } from "./usfunc";
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
      var obj = {};
      setProperty(obj, "id", dataMap.get("id") || "loader.nameless");
      setProperty(obj, "name", dataMap.get("name") || "Nameless");
      setProperty(obj, "author", dataMap.get("author") || "Someone");
      setProperty(obj, "icon", dataMap.get("icon"));
      setProperty(
        obj,
        "description",
        dataMap.get("description") || "A nameless module."
      );
      setProperty(obj, "update", dataMap.get("update"));
      setProperty(obj, "version", dataMap.get("version") || "1.0.0");
      setProperty(obj, "update", dataMap.get("update"));
      var succ = regMeta(dataMap.get("id") || "loader.nameless", obj);
      if (succ) {
        GMSetValue(
          "code-" + (dataMap.get("id") || "loader.nameless"),
          ccode.split("// -MCBBS-Module")[1]
        );
        return dataMap;
      } else {
        return undefined;
      }
    }
  }
}
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
function mountCode(id: string, code: string): void {
  $(() => {
    $("body").append(
      `<script id='code-${id}'>(function(){${code}})()</script>`
    );
  });
}
function unmountCode(id: string): void {
  $(() => {
    $(`#code-${id}`).remove();
  });
}
function deleteModule(id: string): void {
  GMDeleteValue("meta-" + id);
  GMDeleteValue("code-" + id);
  var obj = GMGetValue("loader.all", {});
  setProperty(obj, id, undefined);
  GMSetValue("loader.all", obj);
}
function installFromUrl(url: string) {
  try {
    $.get(url, (dataIn) => {
      try {
        var data = dataIn.toString();
        if (typeof data == "string") {
          addModule(data);
        } else {
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
