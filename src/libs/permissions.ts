import { GMGetValue } from "./usfunc";
const cachedPermission: any = {};
function cachePermission(id: string) {
  if (cachedPermission[id])
    return cachedPermission[id];
  let permissions: any = (cachedPermission[id] = {});
  let meta = GMGetValue("meta-" + id, {});
  if (meta.permissions)
    for (let perm of meta.permissions.split(","))
      permissions[perm.trim()] = true;
  return permissions;
}

function hasPermission(id: string, perm: string) {
  return !!cachePermission(id)[perm.trim()];
}

export { hasPermission };
