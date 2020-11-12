import AInfo from "../api/AInfo";
import AStorage from "../api/AStorage";
import AUser from "../api/AUser";
function loadAll() {
  AInfo.load();
  AStorage.load();
  AUser.load();
}
export default { loadAll };
