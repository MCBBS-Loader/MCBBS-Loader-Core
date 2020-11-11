import $, { data } from "jquery";
import { setProperty } from "./native";
import { GMGetValue, GMSetValue } from "./usfunc";
function addModule(code: string): boolean {
  if (!$.trim(code).startsWith("// MCBBS-Module")) {
    return false;
  } else {
    var ccode = $.trim(code);
    if (ccode.split("// -MCBBS-Module").length != 2) {
      return false;
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
      var succ = regMeta(dataMap.get("id") || "loader.nameless", obj);
      if (succ) {
        GMSetValue(
          "code-" + (dataMap.get("id") || "loader.nameless"),
          ccode.split("// -MCBBS-Module")[1]
        );
        return true;
      } else {
        return false;
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
  var all = GMGetValue("loader.all", []);
  try {
    if (!all.includes(id)) {
      GMSetValue("loader.all", all);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
export { addModule };
