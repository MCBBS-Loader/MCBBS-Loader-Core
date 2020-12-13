function setProperty(obj, key, val) {
  obj[key] = val;
}
function getProperty(obj, key) {
  return obj[key];
}
function setLockedProperty(a, tag, val) {
  Object.defineProperty(a, tag, {
    value: val,
    enumerable: false,
    writable: false,
    configurable: false,
  });
}
function getUnsafeWindow() {
  return unsafeWindow || window;
}
function getGM() {
  return {
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
    GM_setValue,
  };
}
export { setProperty, getProperty, getUnsafeWindow, setLockedProperty, getGM };
