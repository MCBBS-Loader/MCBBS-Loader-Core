import AInfo from "../api/AInfo";
import AStorage from "../api/AStorage";
import AUser from "../api/AUser";
import AjQuery from "../api/AjQuery";
function loadAll() {
  AInfo.load();
  AStorage.load();
  AUser.load();
  AjQuery.load();
}
export default { loadAll };
