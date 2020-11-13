import $ from "jquery";
import { setWindowProperty } from "../libs/usfunc";
function getUserName(): string {
  return $(".username").html();
}
function getUserUID(): string {
  return $("#user_info > div.avt > a").attr("href") || "";
}
function getUserAvatar(): string {
  return ($("#user_info > div.avt > a > img").attr("src") || "").replace(
    "size=small",
    "size=middle"
  );
}
function load() {
  setWindowProperty("AUser", {
    getUserName,
    getUserUID,
    getUserAvatar,
  });
}
export default { load };
