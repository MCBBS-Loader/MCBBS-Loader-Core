import $ from "jquery";
import { getAPIVersion } from "../api/STDAPI";
import { parseMeta, GIDURL } from "./codeload";
import { getCrossOriginData } from "./crossorigin";
function checkUpdate(
  meta: any,
  callback: (state: string, ov?: string, nv?: string) => void
): void {
  let id = meta.id || "loader.nameless";

  let isUrlRegex = /^((file|https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/g;
  if (meta.updateURL || meta.gid) {
    let url = meta.updateURL ? isUrlRegex.test(meta.updateURL) ?
      meta.updateURL : GIDURL.fromString(meta.updateURL, GIDURL.fromString(meta.gid)).getAsURL() :
      GIDURL.fromString(meta.gid).getAsURL();
    getCrossOriginData(url, () => callback("latest-network-err"), data => {
      let dataMap = new Map<string, string>();
      parseMeta(data, dataMap);
      if (dataMap.get("id") != id) {
        callback("latest-diff-id");
      } else {
        if (typeof dataMap.get("version") == "string") {
          let nversion = dataMap.get("version") || "1.0.0";
          let oversion = meta.version || "1.0.0";
          if (cmpVersion(nversion, oversion)) {
            let napiv = dataMap.get("apiVersion");
            if (typeof napiv == "string" && napiv != String(getAPIVersion()))
              callback("latest-api-too-early");
            else
              callback(meta.updateURL, oversion, nversion);
          } else {
            callback("latest-version-equal-or-earlier");
          }
        } else {
          callback("latest-no-version");
        }
      }
    });
  } else {
    callback("latest-no-update-url");
  }
}
function cmpVersion(nv: string, ov: string): boolean {
  let nvl = nv.split(".");
  let ovl = ov.split(".");
  if (nvl.length == 1)
    return parseInt(nvl[0]) > parseInt(ovl[0] || "0");
  for (let i = 0; i < nvl.length; i++)
    if (parseInt(nvl[i]) > parseInt(ovl[i] || "0"))
      return true;
    else if (parseInt(nvl[i]) < parseInt(ovl[i] || "0"))
      return false;
  return false;
}
export { checkUpdate, cmpVersion };
