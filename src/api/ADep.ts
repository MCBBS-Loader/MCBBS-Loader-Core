import { getWindowProperty, setWindowProperty } from "../libs/usfunc";

function load() {
  setWindowProperty("MIDT", {});
  setWindowProperty("ADep", { moduleImport, moduleExport });
}
function moduleExport(idIn: string, obj: any) {
  setWindowProperty(`module-export-${idIn}`, obj);
  notifyExport(idIn);
}
function moduleImport(id: string, callback: (arg: any) => void) {
  if (getWindowProperty(`module-export-${id}`)) {
    callback(getWindowProperty(`module-export-${id}`));
  } else {
    var origin = getWindowProperty("MIDT")[id];
    if (origin) {
      var nc = (obj: any) => {
        origin(obj);
        callback(obj);
      };
      getWindowProperty("MIDT")[id] = nc;
    } else {
      getWindowProperty("MIDT")[id] = callback;
    }
  }
}

function notifyExport(id: string) {
  for (var x in getWindowProperty("MIDT")) {
    if (x == id) {
      getWindowProperty("MIDT")[x](getWindowProperty(`module-export-${id}`));
      var m = getWindowProperty("MIDT");
      delete m[x];
      setWindowProperty("MIDT", m);
    }
  }
}

export default { load };
