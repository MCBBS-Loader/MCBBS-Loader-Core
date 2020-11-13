import { setWindowProperty } from "../libs/usfunc";

import $ from "jquery";
function load() {
  setWindowProperty("AjQuery", { $ });
}

export default { load };
