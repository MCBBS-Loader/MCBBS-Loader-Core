import { IMG_MCBBS, installFromGID } from "./codeload";
import { getProperty } from "./native";
import $ from "jquery";
import manager from "./manager";
import { GMGetValue, GMSetValue } from "./usfunc";
$.ajaxSetup({
  timeout: 10000,
  cache: false,
});
function getManifest(repo: string, cb: (data: any) => void) {
  var manifest = `https://cdn.jsdelivr.net/gh/${repo}/manifest.json`;
  try {
    $.get(manifest, (data) => {
      if (typeof data == "string") {
        cb(JSON.parse(data));
      } else {
        cb(data);
      }
    }).catch(() => {
      $("#all_modules").html("无法显示该软件源的预览。");
    });
  } catch {
    cb(undefined);
  }
}
function dumpPreview(repo: string) {
  $("div[class='bm bw0']").css("user-select", "none");
  $("div[class='bm bw0']").html(
    `<span style='font-size:1.5rem'>正在预览软件源 ${repo}</span>&nbsp;&nbsp;
<input class="px" id="viewsrc" type="text" style="width: 50%" placeholder="输入新的软件源地址来加载预览"/>
&nbsp;<button type="button" id="loadview" class="pn pnc"><strong>加载预览</strong></button>
<br/>
<hr/>
<span style='font-size:1rem'>该软件源中的模块</span>
<br/>
<div style='overflow:auto;'><ul id='all_modules'></ul></div>
<hr/>`
  );
  $("#viewsrc").val(repo);
  $("#loadview").on("click", () => {
    GMSetValue("tmp.preview", $("#viewsrc").val() || repo);
    open(window.location.href, "_self");
  });
  getManifest(repo, (data) => {
    if (data == undefined) {
      $("#all_modules").html("无法显示该软件源的预览。");
    } else {
      for (var [m, x] of Object.entries(data)) {
        var meta = data[m];
        meta.id = meta.id || "impossible";
        meta.name = meta.name || "Nameless";
        meta.author = meta.author || "Someone";
        meta.description = meta.description || "No description provided.";
        meta.permissions = meta.permissions || "";
        var color = "";
        var isCore = false;
        var isInstalled: boolean = false;
        if (GMGetValue(`meta-${meta.id}`) != undefined) {
          isInstalled = true;
        }
        if (meta.permissions.search("loader:core") != -1) {
          color = "#ff0000";
          isCore = true;
        } else {
          color = "#5d2391";
        }
        var installText = "";
        if (isInstalled) {
          color = "#575757";
          installText =
            "&nbsp;<span style='color:#575757'><b>[已安装]</b></span>";
        }
        var ele = `<li id='${
          meta.id || "impossible"
        }'><div style='display:inline;'><img src='${
          meta.icon || IMG_MCBBS
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
              : "") +
            installText
        }</span><br/>&nbsp;&nbsp;<span style='font-size:16px;color:#df307f;'>${
          meta.author || "Someone"
        }</span><br/>&nbsp;&nbsp;<span style='font-size:12px'>${
          meta.description
        }</span><button class='pn pnc insremote' style='float:right;' data-gtar='${
          meta.gid
        }'><strong>安装/更新</strong></button></div></div></li>`;
        $("#all_modules").append(ele);
      }
      $(".insremote").on("click", (e) => {
        var ele;
        if ($(e.target).data("gtar") != undefined) {
          ele = $(e.target);
        } else {
          ele = $(e.target).parent();
        }
        installFromGID(
          ele.data("gtar") || "MCBBS-Loader:examplemod:examplemod:main",
          (st) => {
            manager.onInstall(st);
          },
          (r) => {
            manager.onFailure(r);
          }
        );
      });
    }
  });
}
export default { dumpPreview };
