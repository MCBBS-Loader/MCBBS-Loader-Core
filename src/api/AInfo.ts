import { setWindowProperty } from "../libs/usfunc";
function getAPIVersion(): string {
  return "0.9.4";
}
function load() {
  setWindowProperty("AInfo", { getAPIVersion });
}
export default { load, getAPIVersion };
