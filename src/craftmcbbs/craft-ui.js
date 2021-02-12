import { getUnsafeWindow } from "../libs/native";

function showSuccess(msg, title, callback) {
  getUnsafeWindow().showDialog(msg, "right", title, callback);
}

function showAlert(msg, title, callback) {
  getUnsafeWindow().showDialog(msg, "alert", title, callback);
}

function showDialogFull(config) {
  showDialog(
    config.msg,
    config.mode,
    config.title,
    config.onClick,
    config.cover,
    config.onCancel,
    config.confirmText,
    config.cancelText,
    config.closeTime,
    config.locationTime
  );
}

function showPopper(msg) {
  getUnsafeWindow().showError(msg);
}

export { showAlert, showPopper, showSuccess, showDialogFull };
