import { GMGetValue } from "./usfunc";
import $ from "jquery";
function hasPermission(id: string, perm: string) {
  var meta = GMGetValue("meta-" + id, {});
  if (meta.permissions) {
    var perms = meta.permissions.split(",");
    for (var s of perms) {
      if ($.trim(perm) == $.trim(s)) {
        return true;
      }
    }
  }
  return false;
}
export { hasPermission };
