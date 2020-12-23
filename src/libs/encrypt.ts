var API_TOKEN = Math.floor(Math.random() * 1048576 * 1048576 * 1048576).toString(16);
function getAPIToken() {
  return API_TOKEN;
}
export { getAPIToken };
