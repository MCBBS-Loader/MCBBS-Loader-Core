import jQuery from "jquery";
import $ from "jquery";
import AInfo from "../api/AInfo";
import { addModule, deleteModule } from "./codeload";
import {
  GMGetValue,
  GMNotification,
  GMSetValue,
  setWindowProperty,
} from "./usfunc";
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
      .append(
        `<span style='font-size:1.5rem'>模块管理&nbsp;&nbsp;&nbsp;版本&nbsp;${AInfo.getAPIVersion()}</span>`
      )
      .append("<br/>")
      .append("<hr/>")
      .append("<span style='font-size:1rem'>已安装的模块</span>")
      .append("<br/>")
      .append("<div style='overflow:auto;'><ul id='all_modules'></ul></div>")
      .append("<hr/>")
      .append("<span style='font-size:1rem'>安装新模块</span>")
      .append("<br/>")
      .append(
        `<textarea style="font-family:'Fira Code','Courier New',monospace;background-color:#fbf2db;width:100%;height:150px;overflow:auto;word-break:break-all;resize:vertical;" placeholder='BASE64 编码，URL 或 JavaScript 代码……' id='install_base64'></textarea>`
      )
      .append(
        "<br/><ul><li>访问 GitHub 资源可用 jsDelivr：https://cdn.jsdelivr.net/gh/你的用户名/你的仓库@分支（一般为 master 或 main）/仓库内文件路径</li></ul>"
      )
      .append("<br/>")
      .append(
        "<button class='pn pnc' type='button' id='install'><strong>安装</strong></button>"
      )
      .append("<br/>")
      .append(
        "<span id='install_state' style='font-size:1rem;color:#df307f;'></span>"
      );
    setWindowProperty("notifyUninstall", (e: string) => {
      var t = e;
      deleteModule(t, () => {
        GMSetValue("temp.loadmgr", true);
        open(window.location.href, "_self");
        GMNotification(
          "刚刚移除了，请查看。",
          t,
          "https://www.mcbbs.net/favicon.ico",
          () => {}
        );
      });
    });
    setWindowProperty("notifyOnOff", (e: string, s: string) => {
      var action = s;
      if (GMGetValue("loader.all", {})[s]) {
        var all = GMGetValue("loader.all", {});

        all[e] = false;

        GMSetValue("loader.all", all);
      } else {
        var all = GMGetValue("loader.all", {});
        all[e] = true;
        GMSetValue("loader.all", all);
      }
      GMSetValue("temp.loadmgr", true);
      open(window.location.href, "_self");
    });
    $("#install").on("click", () => {
      var str = $("#install_base64").val()?.toString() || "";
      try {
        var x = atob(str);
        var st = addModule(x);
        if (st) {
          GMSetValue("temp.loadmgr", true);
          open(window.location.href, "_self");
          GMNotification(
            "刚安装好了，请查看。",
            st.get("name") || "Nameless",
            st.get("icon") || "https://www.mcbbs.net/favicon.ico",
            () => {}
          );
          return;
        } else {
          GMNotification(
            "解码后的 BASE64 无效。",
            "安装失败",
            "https://www.mcbbs.net/favicon.ico",
            () => {}
          );
        }
      } catch {
        var isUrlRegex = /^((file|https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/g;
        if (isUrlRegex.test(str)) {
          try {
            $.get(str, (dataIn) => {
              try {
                var data = dataIn.toString();
                if (typeof data == "string") {
                  var st = addModule(data);
                  if (st) {
                    GMSetValue("temp.loadmgr", true);
                    open(window.location.href, "_self");
                    GMNotification(
                      "刚安装好了，请查看。",
                      st.get("name") || "Nameless",
                      st.get("icon") || "https://www.mcbbs.net/favicon.ico",
                      () => {}
                    );
                    return;
                  } else {
                    GMNotification(
                      "AJAX 没有返回有效的 JavaScript。",
                      "安装失败",
                      "https://www.mcbbs.net/favicon.ico",
                      () => {}
                    );
                  }
                } else {
                  GMNotification(
                    "AJAX 没有返回有效的 JavaScript。",
                    "安装失败",
                    "https://www.mcbbs.net/favicon.ico",
                    () => {}
                  );
                }
              } catch {
                GMNotification(
                  "AJAX 没有返回有效的 JavaScript。",
                  "安装失败",
                  "https://www.mcbbs.net/favicon.ico",
                  () => {}
                );
              }
            });
          } catch {
            GMNotification(
              "AJAX 没有返回有效的 JavaScript。",
              "安装失败",
              "https://www.mcbbs.net/favicon.ico",
              () => {}
            );
          }
        } else if (str.startsWith("// MCBBS-Module")) {
          var st = addModule(str);
          if (st) {
            GMSetValue("temp.loadmgr", true);
            open(window.location.href, "_self");
            GMNotification(
              "刚安装好了，请查看。",
              st.get("name") || "Nameless",
              st.get("icon") || "https://www.mcbbs.net/favicon.ico",
              () => {}
            );
            return;
          } else {
            GMNotification(
              "无效 JavaScript。",
              "安装失败",
              "https://www.mcbbs.net/favicon.ico",
              () => {}
            );
          }
        } else {
          GMNotification(
            "无效输入。",
            "安装失败",
            "https://www.mcbbs.net/favicon.ico",
            () => {}
          );
        }
      }
    });
    var all_modules = GMGetValue("loader.all", {});
    for (var m of Object.entries(all_modules)) {
      var meta = GMGetValue("meta-" + m[0], { id: "loader.nameless" });
      var ele = `<li id='${
        meta.id || "loader.nameless"
      }'><div style='display:inline;'><img src='${
        meta.icon || ""
      }' width='50' height='50' style="vertical-align:middle;float:left;"></img><div style="height: 8em">&nbsp;&nbsp;<span style='font-size:0.8rem;color:#5d2391'><strong>${
        meta.name || "Nameless"
      }</strong></span>&nbsp;&nbsp;&nbsp;<span style='font-size:12px;color:#150029;'>${
        meta.id || "loader.nameless"
      }@${
        meta.version || "1.0.0"
      }</span><br/>&nbsp;&nbsp;<span style='font-size:24px;color:#df307f;'>${
        meta.author || "Someone"
      }</span><br/>&nbsp;&nbsp;<span style='font-size:12px'>${
        meta.description
      }</span><button style='float:right;' type='button' class='pn pnc remove' onclick='window.notifyUninstall("${
        meta.id
      }")'><strong>删除模块</strong></button>&nbsp;&nbsp;<button style='float:right;' type='button' class='pn pnc onoff' onclick='window.notifyOnOff("${
        meta.id
      }","${meta.id}")'><strong>${
        GMGetValue("loader.all", {})[meta.id] ? "禁用" : "启用"
      }</strong></button></div></div></li>`;
      $("#all_modules").append(ele);
    }
  });
}

export default { createBtn, createMenu, dumpManager };
