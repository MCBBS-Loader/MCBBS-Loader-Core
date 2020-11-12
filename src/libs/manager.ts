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
      .append("<div style='overflow:auto;'><ul id='all_modules'></ul></div>")
      .append("<hr/>")
      .append("<span style='font-size:1rem'>安装新模块</span>")
      .append("<br/>")
      .append(
        "<textarea style='font-family:'Fira Code','Courier New',monospace;background-color:#fbf2db;width:80%;overflow:auto;word-break:break-all;resize:vertical;' placeholder='BASE64 编码，URL 或 JavaScript代码……' id='install_base64'></textarea>"
      )
      .append("<br/><br/>")
      .append(
        "<button class='pn pnc' type='button' id='install'><strong>安装</strong></button>"
      )
      .append("<br/>")
      .append(
        "<span id='install_state' style='font-size:1rem;color:#df307f;'></span>"
      );
    $("#install").on("click", () => {
      var str = $("#install_base64").val()?.toString() || "";
      try {
        var x = atob(str);
        if (addModule(x)) {
          $("#install_state").html("模块添加成功，刷新页面试试吧！");
          return;
        } else {
          $("#install_state").html("模块添加失败，该 BASE64 解码无效。");
        }
      } catch {
        var isUrlRegex = /^((file|https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/g;
        if (isUrlRegex.test(str)) {
          try {
            $.get(str, (dataIn) => {
              try {
                var data = dataIn.toString();
                if (typeof data == "string") {
                  if (addModule(data)) {
                    $("#install_state").html("模块添加成功，刷新页面试试吧！");
                    return;
                  } else {
                    $("#install_state").html(
                      "模块添加失败，AJAX 返回的 JavaScript 代码无效。"
                    );
                  }
                } else {
                  $("#install_state").html(
                    "模块添加失败，AJAX 返回的数据无效。"
                  );
                }
              } catch {
                $("#install_state").html("模块添加失败，AJAX 返回的数据无效。");
              }
            });
          } catch {
            $("#install_state").html("模块添加失败，AJAX 返回错误。");
          }
        }
        if (str.startsWith("// MCBBS-Module")) {
          if (addModule(str)) {
            $("#install_state").html("模块添加成功，刷新页面试试吧！");
            return;
          } else {
            $("#install_state").html("模块添加失败，JavaScript 代码无效。");
          }
        }
      }
      $("#install_state").html("模块添加失败，无效输入。");
    });
    var all_modules = GMGetValue("loader.all", {});
    for (var m of Object.entries(all_modules)) {
      var meta = GMGetValue("meta-" + m[0], { id: "loader.nameless" });
      var ele = `<li id='${
        meta.id || "loader.nameless"
      }'><div style='display:inline;'><img src='${
        meta.icon || ""
      }' width='48' height='48' style="vertical-align:middle;float:left;"></img><div><span style='font-size:1rem;color:#5d2391'><strong>${
        meta.name || "Nameless"
      }</strong></span><br/><span style='font-size:0.6rem;color:#df307f;'>${
        meta.author || "Someone"
      }</span><button style='float:right;' type='button' class='pn pnc remove' ref='${
        meta.id || "loader.nameless"
      }'>删除模块</button></div></div></li>`;
      $("#all_modules").append(ele);
      $(".remove").on("click", (e) => {
        var el = e.target;
        deleteModule($(el).attr("ref") || "loader.nameless");
        $("#install_state").html("已尝试移除模块，刷新页面试试吧！");
      });
    }
  });
}
export default { createBtn, createMenu, dumpManager };
