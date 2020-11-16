import $ from "jquery";
import { installFromUrl } from "./codeload";
function setup(callback: () => void): void {
  $.get(
    "https://cdn.jsdelivr.net/gh/MCBBS-Loader/MCBBS-Loader-Data@main/batteries.json",
    (data) => {
      if (data) {
        var all = data;
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
