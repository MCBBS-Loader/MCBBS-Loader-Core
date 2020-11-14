import { GMDownload, setWindowProperty } from "../libs/usfunc";

function load() {
  setWindowProperty("ADown", { download: GMDownload });
}
export default { load };
