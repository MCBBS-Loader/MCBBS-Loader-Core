import { setWindowProperty } from "../libs/usfunc";
function getAPIVersion(): string {
  return "1.0.0";
}
function load() {
  setWindowProperty("AInfo", { getAPIVersion });
}
export default { load };
