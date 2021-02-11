import { getUnsafeWindow } from "../libs/native";

function showSuccess(msg, title, callback) {
  getUnsafeWindow().showDialog(msg, "right", title, callback);
}

function showAlert(msg, title, callback) {
  getUnsafeWindow().showDialog(msg, "alert", title, callback);
}

function showPopper(msg) {
  getUnsafeWindow().showError(msg);
}

export { showAlert, showPopper, showSuccess };
