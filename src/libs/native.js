function setProperty(obj, key, val) {
  obj[key] = val;
}
function getProperty(obj, key) {
  return obj[key];
}
function getUnsafeWindow() {
  return unsafeWindow || window;
}
export { setProperty, getProperty, getUnsafeWindow };
