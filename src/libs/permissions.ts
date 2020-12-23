import { GMGetValue } from "./usfunc";
const cachedPermission: any = {};
function cachePermission(id: string) {
  if(cachedPermission[id]) {
    return cachedPermission[id];
  }
  var permissions: any = cachedPermission[id] = {};
  var meta = GMGetValue("meta-" + id, {});
  if (meta.permissions) {
    for(var perm of meta.permissions) {
      permissions[perm.trim()] = true;
    }
  }
  return permissions
}
function hasPermission(id: string, perm: string) {
  return !!cachePermission(id)[perm.trim()];
}
export { hasPermission };
