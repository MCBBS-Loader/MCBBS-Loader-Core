import { GMGetValue, setWindowProperty } from "../libs/usfunc";
import manager from "../libs/manager";
var dumpManager = manager.dumpManager;
function getAllModules() {
  return GMGetValue("loader.all", []);
}
function load() {
  setWindowProperty("AManager", { dumpManager, getAllModules });
}
