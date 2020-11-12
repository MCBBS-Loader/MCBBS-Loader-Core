import $ from "jquery";
import { setWindowProperty } from "../libs/usfunc";
function getCurrentUserName(): string {
  return $(".username").html();
}
function getCurrentUserUID(): string {
  return $("#user_info > div.avt > a").attr("href") || "";
}
function getCurrentUserAvatar(): string {
  return ($("#user_info > div.avt > a > img").attr("src") || "").replace(
    "size=small",
    "size=middle"
  );
}
function load() {
  setWindowProperty("AUser", {
    getCurrentUserName,
    getCurrentUserUID,
    getCurrentUserAvatar,
  });
}
export default { load };
