import jQuery from "jquery";
import $ from "jquery";
import { getAPIVersion } from "../api/NTAPI";
import {
  addModule,
  deleteModule,
  getDependencyError,
  getTmpDisabled,
  installFromGID,
  installFromUrl,
  isDependencySolved,
  isDirty,
  markDirty,
  resortDependency,
} from "./codeload";
import { closepop, popinfo, registryTimer } from "./popinfo";
import { success, warn } from "./popinfo2";
import { checkUpdate } from "./updator";
import { GMGetValue, GMSetValue, setWindowProperty } from "./usfunc";
import { showAlert, showDialogFull } from "../craftmcbbs/craft-ui";

$.ajaxSetup({
  timeout: 10000,
  cache: false,
});

function createBtn(): void {
  jQuery(() => {
    $("ul.user_info_menu_btn").append(
      "<li><a href='https://www.mcbbs.net/home.php?mod=spacecp&bbsmod=manager'>MCBBS 模块管理</a></li>"
    );
  });
}

function createMenu(): void {
  if (
    String(window.location).startsWith(
      "https://www.mcbbs.net/home.php?mod=spacecp"
    )
  ) {
    jQuery(() => {
      $("div.appl > div.tbn > ul").prepend(
        "<li><a href='https://www.mcbbs.net/home.php?mod=spacecp&bbsmod=manager' style='cursor:pointer;'>模块管理</a></li>"
      );
    });
  }
}

const isCoreModWarn: string =
  "这是一个 CoreMod，它拥有和 MCBBS Loader 一样的权限，在使用时，请注意安全。";

function onInstall(st: Map<string, string>) {
  resortDependency();
  dumpManager();
  $("#install_base64").val(GMGetValue(`code-${st.get("id")}`, ""));
  let isCore = false;
  if ((st.get("permissions")?.search("loader:core") as any) >= 0) {
    isCore = true;
    warn(
      "您安装了一个 CoreMod，请当心，CoreMod 拥有很高的权限，可能会破坏 MCBBS Loader。如果这不是您安装的，请移除它：" +
        st.get("id") +
        "。"
    );
  } else {
    showDialogFull({
      msg: `${st.get("name")}
          已成功安装在您的 MCBBS 上。
          
          以下是有关本次安装的详情：
          
          软件包类型：Mod
          软件包 ID：${st.get("id") || "未知"}
          作者：${st.get("author") || "未知"}${
        isCore ? "\n" + isCoreModWarn : ""
      }
          版本：${st.get("version")}
          
          `,
      title: "安装简报",
      mode: "right",
    });
    success("成功安装了模块");
  }
}

// 安装失败时的动作
function onFailure(st: string) {
  showAlert(st, "安装失败", () => {});
}

function dumpManager() {
  var emsg = getDependencyError().replace(/\n/g, "<br>");
  jQuery(() => {
    $("div[class='bm bw0']")
      .css("user-select", "none")
      .html(
        `<span style='font-size:1.5rem'>模块管理&nbsp;&nbsp;&nbsp;版本&nbsp;${getAPIVersion()}
<span style="font-size: 0.8em;color:red" >${
          // 这个大字太吓人了，改小点
          !isDependencySolved() ? "<br>依赖关系未解决" : ""
        }</span>
<span style="font-size: 0.8em;color: brown" >${
          isDirty() ? "<br>当前的设置需要刷新才能生效" : ""
        }</span></span>
<br/>
<hr/>
<span style='${
          !isDependencySolved() ? "" : "display:none;"
        }font-size:1rem;'>错误</span>

<div id='deperr' style='overflow:auto;color:#ff0000;${
          !isDependencySolved() ? "" : "display:none;"
        }'>${emsg}</div>
<hr style='${!isDependencySolved() ? "" : "display:none;"}'/>
<span style='font-size:1rem'>已安装的模块</span>
<br/>
<div style='overflow:auto;'><ul id='all_modules'></ul></div>
<hr/>
<span style='font-size:1rem'>安装新模块</span>
<button debug='false' type='button' id='debugmode' class='pn pnc'><strong>调试模式</strong></button>
<br/>
<textarea style="display:none;font-family:'Fira Code','Courier New',monospace;background-color:#fbf2db;width:90%;height:150px;overflow:auto;word-break:break-all;resize:vertical;" placeholder='BASE64 编码，URL 或 JavaScript 代码……' id='install_base64'></textarea>
<br/>
<input style='width:90%;font-family:"Fira Code","Courier New",monospace;' type='text' class='px' id='install_uno' placeholder='使用 ID 或 URL 安装……'/>
<br/>
<br/>
<button class='pn pnc' type='button' id='install'><strong>安装</strong></button>
<br/>
<br/>
<br/>
<button class='pn pnc srcc' type='button' id='use_mloader'><strong>快速使用 MCBBS Loader 源（MCBBS-Loader）</strong></button>
<span class='srcc'>MCBBS Loader 电池源，其中的模块是为用户专门设计的，<a id='preview_ml' style='color:#df307f' href='https://www.mcbbs.net/home.php?mod=spacecp&bbsmod=repopreview#MCBBS-Loader%2FMCBBS-Loader-Batteries%40main' target='_blank'>预览该软件源</a>。</span>
<br/>
<br/>
<button class='pn pnc srcc' type='button' id='use_cv'><strong>快速使用 洞穴夜莺 源（CaveNightingale）</strong></button>
<span class='srcc'>洞穴夜莺的软件源中包含许多轻松使用模块，<a id='preview_cv' style='color:#df307f' href='https://www.mcbbs.net/home.php?mod=spacecp&bbsmod=repopreview#CaveNightingale%2FCaveNightingale-MCBBS-Modules%40master' target='_blank'>预览该软件源</a>。</span>
<br/>
<br/>
<button class='pn pnc srcc' type='button' id='use_mext'><strong>快速使用 MExt 整合运动 源（MExt-IM）</strong></button>
<span class='srcc'>MExt 整合运动的软件源中包括了许多适合老用户的 MExt 模块，<a id='preview_mext' style='color:#df307f' href='https://www.mcbbs.net/home.php?mod=spacecp&bbsmod=repopreview#MCBBS-Loader%2FIntegration-Motion%40main' target='_blank'>预览该软件源</a>。</span>
<br/>`
      );
    $("#use_mloader").on("click", () => {
      $("#install_uno").val("MCBBS-Loader:仓库名:模块 ID:main");
    });
    $("#use_cv").on("click", () => {
      $("#install_uno").val(
        "CaveNightingale:CaveNightingale-MCBBS-Modules:模块 ID:master"
      );
    });
    $("#use_mext").on("click", () => {
      $("#install_uno").val("MCBBS-Loader:Integration-Motion:模块 ID:main");
    });

    $("#debugmode").on("click", () => {
      if ($("#debugmode").attr("debug") == "false") {
        $("#debugmode").attr("debug", "true");
        $("#install_base64").show();
        $("#install_uno").hide();
        $(".srcc").hide();
      } else {
        $("#debugmode").attr("debug", "false");
        $("#install_base64").hide();
        $("#install_uno").show();
        $(".srcc").show();
      }
    });

    setWindowProperty("notifyUninstall", (id: string) => {
      deleteModule(id, () => {
        resortDependency();
        dumpManager();
        popinfo("trash", "成功移除了模块", false);
        registryTimer(setTimeout(closepop, 4000));
      });
    });
    setWindowProperty("notifyOnOff", (id: string) => {
      var all = GMGetValue("loader.all", {});
      all[id] = !all[id];
      GMSetValue("loader.all", all);
      markDirty();
      resortDependency();
      dumpManager();
    });
    $("#install").on("click", () => {
      var src;
      if ($("#debugmode").attr("debug") == "true") {
        src = "#install_base64";
      } else {
        src = "#install_uno";
      }
      var str = $(src).val()?.toString() || "";

      try {
        var x = atob(str);

        var st = addModule(x);
        if (typeof st != "string") {
          onInstall(st);
        } else {
          var isUrlRegex = /^((file|https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/g;
          if (isUrlRegex.test(str)) {
            popinfo("cloud", "正在获取数据……");
            try {
              $.get(str, (dataIn) => {
                try {
                  var data = dataIn.toString();
                  var st =
                    typeof data === "string"
                      ? addModule(data)
                      : "接收了一个无效数据值";
                  if (typeof st != "string") {
                    onInstall(st);
                  } else {
                    onFailure(st);
                  }
                } catch {
                  onFailure("接收了一个无效数据值");
                }
              });
            } catch {
              var st = addModule(str);
              if (typeof st != "string") {
                onInstall(st);
              } else {
                installFromGID(
                  str,
                  (st) => {
                    onInstall(st);
                  },
                  (reason) => {
                    onFailure(reason);
                  }
                );
              }
            }
          } else {
            var st = addModule(str);
            if (typeof st != "string") {
              onInstall(st);
            } else {
              installFromGID(
                str,
                (st) => {
                  onInstall(st);
                },
                (reason) => {
                  onFailure(`无效 ID 或网络错误，所有安装途径均失败`);
                }
              );
            }
          }
        }
      } catch {
        var isUrlRegex = /^((file|https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/g;
        if (isUrlRegex.test(str)) {
          popinfo("cloud", "正在获取数据……");
          try {
            $.get(str, (dataIn) => {
              try {
                var data = dataIn.toString();
                var st =
                  typeof data === "string"
                    ? addModule(data)
                    : "接收了一个无效数据值";
                if (typeof st != "string") {
                  onInstall(st);
                } else {
                  onFailure(st);
                }
              } catch {
                onFailure("接收了一个无效数据值");
              }
            });
          } catch {
            var st = addModule(str);
            if (typeof st != "string") {
              onInstall(st);
            } else {
              installFromGID(
                str,
                (st) => {
                  onInstall(st);
                },
                (reason) => {
                  onFailure(`无效 ID 或网络错误，所有安装途径均失败`);
                }
              );
            }
          }
        } else {
          var st = addModule(str);
          if (typeof st != "string") {
            onInstall(st);
          } else {
            installFromGID(
              str,
              (st) => {
                onInstall(st);
              },
              (reason) => {
                onFailure(`无效 ID 或网络错误，所有安装途径均失败`);
              }
            );
          }
        }
      }
    });
    var all_modules = GMGetValue("loader.all", {});
    for (var m of Object.entries(all_modules)) {
      var meta = GMGetValue("meta-" + m[0], { id: "impossible" });
      var color = "";
      var isCore = false;
      if (meta.permissions.search("loader:core") != -1) {
        color = "#ff0000";
        isCore = true;
      } else {
        color = "#5d2391";
      }
      var ele = `<li id='${
        meta.id || "impossible"
      }'><div style='display:inline;'><img src='${
        meta.icon || ""
      }' width='50' height='50' style="vertical-align:middle;float:left;"/><div style="height: 8em">&nbsp;&nbsp;<span style='font-size:18px;color:${color}'><strong>${
        meta.name || "Nameless"
      }</strong></span>&nbsp;&nbsp;&nbsp;<span id='vtag-${
        meta.id
      }' style='font-size:12px;color:#150029;'>${
        meta.id || "loader.nameless"
      }@${
        meta.version ||
        "1.0.0" +
          (isCore
            ? "&nbsp;<span style='color:#ff0000'><b>[COREMOD]</b></span>"
            : "")
      }<span style='color:#df307f;${
        getTmpDisabled().includes(meta.id) ? "" : "display: none;"
      }'>[依赖关系原因停用]</span></span><br/>&nbsp;&nbsp;<span style='font-size:16px;color:#df307f;'>${
        meta.author || "Someone"
      }</span><br/>&nbsp;&nbsp;<span style='font-size:12px'>${
        meta.description
      }</span><div style="float: right;"><button type='button' class='pn pnc remove' onclick='window.notifyUninstall("${
        meta.id
      }")'><strong>删除模块</strong></button>&nbsp;&nbsp;<button type='button' class='pn pnc onoff' onclick='window.notifyOnOff("${
        meta.id
      }")'><strong>${
        GMGetValue("loader.all", {})[meta.id] ? "禁用" : "启用"
      }</strong></button><button type='button' class='pn pnc showsrc' data-mlsource='${
        meta.id
      }'><strong>查看源代码</strong></button></div></div></div></li>`;
      $("#all_modules").append(ele);
    }
    $(".showsrc").on("click", (e) => {
      if ($("#debugmode").attr("debug") == "false") {
        $("#debugmode").attr("debug", "true");
        $("#install_base64").show();
        $("#install_uno").hide();
        $(".srcc").hide();
      }
      var id =
        $(e.target).data("mlsource") || $(e.target).parent().data("mlsource");
      if (!id) {
        return;
      }
      $("#install_base64").val(GMGetValue(`code-${id}`, ""));
    });
    $("#all_modules > li").each((i, e) => {
      var id = $(e).attr("id") || "loader.impossible";
      var meta = GMGetValue(`meta-${id}`);

      checkUpdate(meta, (state, ov, nv) => {
        var gtxt;
        var shouldUpdate = false;
        switch (state) {
          case "latest-api-too-early":
            gtxt = `<span style='color:#f16d2e'><b>[已过期]</b></span>`;
            break;
          case "latest-no-update-url":
          case "latest-no-version":
            gtxt = `<span style='color:#636363'><b>[本地]</b></span>`;
            break;
          case "latest-version-equal-or-earlier":
            gtxt = `<span style='color:#df307f'><b>[最新]</b></span>`;
            break;
          default:
            if (!state.startsWith("latest")) {
              gtxt = `<span style='color:#ffaec8'><b>[有可用更新]</b></span>`;
              shouldUpdate = true;
            }
        }
        var oh = $(`[id='vtag-${meta.id}']`).html();

        oh = `${oh}${shouldUpdate ? "&nbsp;->&nbsp;" + nv : ""}&nbsp;${gtxt}`;

        $(`[id='vtag-${meta.id}']`).html(oh);
        if (shouldUpdate) {
          $(`[id='vtag-${meta.id}']`)
            .parent()
            .append(
              `<button type='button' style='float:right' class='pn pnc update' data-mlurl='${state}'><strong>更新模块</strong></button>`
            );
        }
        $(".update").on("click", (e) => {
          var url =
            $(e.target).data("mlurl") || $(e.target).parent().data("mlurl");
          if (!url) {
            return;
          }
          if ($(e.target).data("mlurl")) {
            $(e.target).remove();
          } else {
            $(e.target).parent().remove();
          }
          markDirty();
          installFromUrl(
            url,
            () => {
              dumpManager();

              var oh = $(`[id='vtag-${meta.id}']`).html();

              oh = oh.replace(
                `<span style="color:#ffaec8"><b>[有可用更新]</b></span>`,
                `<span style='color:#df307f'><b>[已更新]</b></span>`
              );
              $(`[id='vtag-${meta.id}']`).html(oh);
            },
            () => {
              var oh = $(`[id='vtag-${meta.id}']`).html();
              oh = oh.replace(
                `<span style="color:#ffaec8"><b>[有可用更新]</b></span>`,
                `<span style='color:#ec1c24'><b>[更新失败]</b></span>`
              );
              $(`[id='vtag-${meta.id}']`).html(oh);
            }
          );
          popinfo(
            "cloud",
            "已尝试更新，更新效果在更新完成后刷新页面才会显示。",
            false
          );
          registryTimer(setTimeout(closepop, 5000));
        });
      });
    });
  });
}

export default { createBtn, createMenu, dumpManager, onInstall, onFailure };
