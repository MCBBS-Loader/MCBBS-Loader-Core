import $ from "jquery";
import { installFromUrl, resortDependency } from "./codeload";
function setup(callback: () => void): void {
  $.get(
    "https://cdn.jsdelivr.net/gh/MCBBS-Loader/MCBBS-Loader-Data@main/batteries.json",
    (data) => {
      data?.forEach(installFromUrl);
      callback();
    }
  );
}
export { setup };
