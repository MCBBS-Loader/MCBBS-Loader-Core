import $ from "jquery";
import { getAPIVersion } from "../api/NTAPI";
import { parseMeta } from "./codeload";
import { PackageURL } from "./pkgresolve";
$.ajaxSetup({
  timeout: 10000,
  cache: false,
});
function checkUpdate(
  meta: any,
  callback: (state: string, ov?: string, nv?: string) => void
): void {
  var id = meta.id || "loader.nameless";

  var isUrlRegex = /^((file|https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/g;
  if (meta.updateURL && isUrlRegex.test(meta.updateURL)) {
    try {
      $.get(meta.updateURL, (data) => {
        var ccode = data.toString();

        var dataMap = new Map<string, string>();
        parseMeta(ccode, dataMap);
        if (dataMap.get("id") != id) {
          callback("latest-diff-id");
        } else {
          if (typeof dataMap.get("version") == "string") {
            var nversion = dataMap.get("version") || "1.0.0";
            var oversion = meta.version || "1.0.0";
            if (cmpVersion(nversion, oversion)) {
              if (typeof dataMap.get("apiVersion") == "string") {
                if (
                  dataMap.get("apiVersion") !=
                  new String(getAPIVersion()).toString()
                ) {
                  callback("latest-api-too-early");
                  return;
                }
              }
              callback(meta.updateURL, oversion, nversion);
              return;
            } else {
              callback("latest-version-equal-or-earlier");
              return;
            }
          } else {
            callback("latest-no-version");
          }
        }
      });
    } catch {
      callback("latest-no-update-url");
    }
  } else if (meta.updateURL) {
    try {
      var gurl = new PackageURL(meta.updateURL).getAsURL();

      $.get(gurl, (data) => {
        var ccode = data.toString();

        var dataMap = new Map<string, string>();
        parseMeta(ccode, dataMap);
        if (dataMap.get("id") != id) {
          callback("latest-diff-id");
        } else {
          if (typeof dataMap.get("version") == "string") {
            var nversion = dataMap.get("version") || "1.0.0";
            var oversion = meta.version || "1.0.0";
            if (cmpVersion(nversion, oversion)) {
              if (typeof dataMap.get("apiVersion") == "string") {
                if (
                  dataMap.get("apiVersion") !=
                  new String(getAPIVersion()).toString()
                ) {
                  callback("latest-api-too-early");
                  return;
                }
              }
              callback(gurl, oversion, nversion);
              return;
            } else {
              callback("latest-version-equal-or-earlier");
              return;
            }
          } else {
            callback("latest-no-version");
            return;
          }
        }
      });
    } catch {
      callback("latest-no-update-url");
      return;
    }
  } else {
    callback("latest-no-update-url");
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
export { checkUpdate, cmpVersion };
