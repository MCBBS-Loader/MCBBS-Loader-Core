import $ from "jquery";
import { addModule, installFromUrl } from "./codeload";
function setup(callback: () => void): void {
  $.get(
    "https://cdn.jsdelivr.net/gh/MCBBS-Loader/MCBBS-Loader-Data@main/batteries.json",
    (data) => {
      if (data) {
        var all = JSON.parse(data.toString() || "[]");
        for (var x of all) {
          installFromUrl(x);
        }
        callback();
      } else {
        callback();
      }
    }
  );
}
export { setup };
