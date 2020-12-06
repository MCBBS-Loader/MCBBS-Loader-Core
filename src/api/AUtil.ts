import { closepop, popinfo } from "../libs/popinfo";
import { GMNotification, setWindowProperty } from "../libs/usfunc";

function load() {
  setWindowProperty("AUtil", {
    notification: GMNotification,
    popInfo: popinfo,
    closePop: closepop,
  });
}
export default { load };
