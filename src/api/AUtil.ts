import { GMNotification, setWindowProperty } from "../libs/usfunc";

function load() {
  setWindowProperty("AUtil", { notification: GMNotification });
}
export default { load };
