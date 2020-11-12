import { GMGetValue, GMSetValue, setWindowProperty } from "../libs/usfunc";

function storeData(tag: string, data: any): void {
  GMSetValue("data-" + tag, data);
}
function getData(tag: string, defaultVal: any): any {
  return GMGetValue("data-" + tag, defaultVal);
}
function load() {
  setWindowProperty("AStorage", { storeData, getData });
}
export default { load };
