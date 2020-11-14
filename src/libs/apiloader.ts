import AInfo from "../api/AInfo";
import AStorage from "../api/AStorage";
import AUser from "../api/AUser";
import AjQuery from "../api/AjQuery";
import AManager from "../api/AManager";
import AUtil from "../api/AUtil";
import ADown from "../api/ADown";
function loadAll() {
  AInfo.load();
  AStorage.load();
  AUser.load();
  AjQuery.load();
  AManager.load();
  AUtil.load();
  ADown.load();
}
export default { loadAll };
