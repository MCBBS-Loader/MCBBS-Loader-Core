import { GMGetValue, GMSetValue, setWindowProperty } from "../libs/usfunc";
import $ from "jquery";

function openManager() {
  GMSetValue("temp.loadmgr", true);
  open("https://www.mcbbs.net/home.php?mod=spacecp", "_self");
}
function getAllModules() {
  return GMGetValue("loader.all", []);
}
function load() {
  setWindowProperty("AManager", { openManager, getAllModules, require });
}
function require(url: string, callback: () => void) {
  $.get(url, (data) => {
    $("body").append(
      `<script>(function(){${data.toString() || ""}})()</script>`
    );
    callback();
  });
}
export default { load };
