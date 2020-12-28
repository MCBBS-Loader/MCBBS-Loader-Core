import $ from "jquery";
import { installFromUrl } from "./codeload";
$.ajaxSetup({
  timeout: 10000,
  cache: false,
});
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
