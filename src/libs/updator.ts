import { parseItem } from "./codeload";
import $ from "jquery";
function checkUpdate(meta: any, callback: (state: string) => void): void {
  var id = meta.id || "loader.nameless";
  if (meta.update) {
    $.get(meta.update, (data) => {
      var ccode = data.toString();
      var metac = ccode.split("// -MCBBS-Module")[0];
      var lines = metac.split("// MCBBS-Module")[1].split("\n");
      var dataMap = new Map<string, string>();
      for (var l of lines) {
        parseItem(l, dataMap);
      }
      if (dataMap.get("id") != id) {
        callback("latest");
      } else {
        if (typeof dataMap.get("version") == "string") {
          var nversion = dataMap.get("version") || "1.0.0";
          var oversion = meta.version || "1.0.0";
          if (cmpVersion(nversion, oversion)) {
            callback(meta.update);
          } else {
            callback("latest");
          }
        } else {
          callback("latest");
        }
      }
    });
  } else {
    callback("latest");
  }
}
function cmpVersion(nv: string, ov: string): boolean {
  var nvl = nv.split(".");
  var ovl = ov.split(".");
  if (nvl.length == 1) {
    if (parseInt(nvl[0]) > parseInt(ovl[0] || "0")) {
      return true;
    } else {
      return false;
    }
  } else {
    for (var i = 0; i < nvl.length; i++) {
      if (parseInt(nvl[i]) > parseInt(ovl[i] || "0")) {
        return true;
      }
      if (parseInt(nvl[i]) < parseInt(ovl[i] || "0")) {
        return false;
      }
    }
    return false;
  }
}
export { checkUpdate };
