function GMDeleteValue(name) {
  GM_deleteValue(name);
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
function setWindowProperty(key, value) {
  unsafeWindow[key] = value;
}
function getWindowProperty(key) {
  return unsafeWindow[key];
}
export {
  GMDeleteValue,
  GMSetValue,
  GMGetValue,
  GMLog,
  setWindowProperty,
  getWindowProperty,
};
