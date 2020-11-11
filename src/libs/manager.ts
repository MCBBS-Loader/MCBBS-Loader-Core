import jQuery from "jquery";
import $ from "jquery";
import { addModule, deleteModule } from "./codeload";
import { GMGetValue, GMSetValue } from "./usfunc";
function createBtn(): void {
  jQuery(() => {
    $("ul.user_info_menu_btn").append(
      "<li><a id='openmgr' href='https://www.mcbbs.net/home.php?mod=spacecp'>MCBBS 模块管理</a></li>"
    );
    $("ul.user_info_menu_btn > li > a#openmgr").on("click", () => {
      GMSetValue("temp.loadmgr", true);
    });
  });
}
function createMenu(): void {
  jQuery(() => {
    $("div.appl > div.tbn > ul").prepend(
      "<li><a id='manage_modules' style='cursor:pointer;'>模块管理</a></li>"
    );
    $("#manage_modules").on("click", () => {
      dumpManager();
    });
  });
}
function dumpManager() {
  jQuery(() => {
    $("div[class='bm bw0']").children().remove();
    $("div[class='bm bw0']")
      .append("<span style='font-size:1.5rem'>模块管理</span>")
      .append("<br/>")
      .append("<hr/>")
      .append("<span style='font-size:1rem'>已安装的模块</span>")
      .append("<br/>")
      .append("<ul id='all_modules'></ul>")
      .append("<hr/>")
      .append("<span style='font-size:1rem'>安装新模块</span>")
      .append("<br/>")
      .append(
        "<textarea placeholder='BASE64 编码……' id='install_base64'></textarea>"
      )
      .append(
        "<button class='pn pnc' type='button' id='install'><strong>安装</strong></button>"
      )
      .append("<br/>")
      .append(
        "<span id='install_state' style='font-size:0.8rem;color:#df307f;'></span>"
      );
    $("#install").on("click", () => {
      addModule(atob($("#install_base64").val()?.toString() || ""));
    });
    var all_modules = GMGetValue("loader.all", {});
    for (var m of Object.entries(all_modules)) {
      var meta = GMGetValue("meta-" + m[0], { id: "loader.nameless" });
      var ele = `<li id='${meta.id || "loader.nameless"}'><div><img src='${
        meta.icon || ""
      }' width='32' height='32'></img><span style='font-size:0.8rem'>${
        meta.name || "Nameless"
      }</span><button type='button' class='pn pnc' id='remove' ref='${
        meta.id || "loader.nameless"
      }'>删除模块</button></div></li>`;
      // FIXME delete no effect
      $("#all_modules").append(ele);
      $("#remove").on("click", (el) => {
        deleteModule($(el).attr("ref") || "loader.nameless");
      });
    }
  });
}
export default { createBtn, createMenu, dumpManager };
