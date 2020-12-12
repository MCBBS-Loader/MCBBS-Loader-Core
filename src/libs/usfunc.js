function GMAddStyle(css) {
  return GM_addStyle(css);
}
function GMDeleteValue(name) {
  GM_deleteValue(name);
}
function GMListValues() {
  return GM_listValues();
}
function GMSetValue(name, value) {
  GM_setValue(name, value);
}
function GMGetValue(name, defaultValue) {
  return GM_getValue(name, defaultValue);
}
function GMLog(msg) {
  GM_log(msg);
}
function GMGetResourceText(name) {
  return GM_getResourceText(name);
}
function GMGetResourceURL(name) {
  return GM_getResourceURL(name);
}
function GMNotification(text, title, image, onclick) {
  GM_notification(text, title, image, onclick);
}
function GMSetClipBoard(data, info) {
  GM_setClipboard(data, info);
}
function GMDownload(url, name) {
  GM_download(url, name);
}
function setWindowProperty(key, value) {
  unsafeWindow[key] = value;
}
function getWindowProperty(key) {
  return unsafeWindow[key];
}
const GM = {
  GM_addStyle,
  GM_deleteValue,
  GM_download,
  GM_getResourceText,
  GM_getResourceURL,
  GM_getValue,
  GM_listValues,
  GM_log,
  GM_notification,
  GM_setClipboard,
  GM_setValue
};
export {
  GMAddStyle,
  GMDeleteValue,
  GMListValues,
  GMSetValue,
  GMGetValue,
  GMLog,
  GMGetResourceText,
  GMGetResourceURL,
  GMNotification,
  GMSetClipBoard,
  GMDownload,
  setWindowProperty,
  getWindowProperty,
  GM
};
