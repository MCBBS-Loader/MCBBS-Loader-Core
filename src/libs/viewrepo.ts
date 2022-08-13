import { GIDURL, installFromGID, resortDependency } from "./codeload";
import $ from "jquery";
import manager from "./manager";
import { GMGetValue } from "./usfunc";
import { showAlert, showPopper, showSuccess } from "../craftmcbbs/craft-ui";
import { HTML_VIEWREPO_BODY, IMG_MCBBS } from "./static";
import { getCrossOriginData } from "./crossorigin";
function getManifest(repo: GIDURL, cb: (data: any) => void) {
  getCrossOriginData(repo.getAsURL(".json"), msg => $("#all_modules").html("无法显示该软件源的预览。<br/>" + msg), cb, "json");
}

function noExec(...data: string[]) {
  let find = (ele: Element) => {
    // disallow javascript, java, flash and iframe
    if(ele.tagName == "script" || ele.tagName == "object" || ele.tagName == "iframe" || ele.tagName == "frame" || ele.tagName == "applet")
      throw 1;
    for(var attr of ele.attributes) {
      if(attr.name.startsWith("on")) {
        throw 1;
      }
    }
    for(var child of ele.children) {
      find(child);
    }
  };
  for(var i of data) {
    var span = document.createElement("span");
    span.innerHTML = i;
    find(span);
  }
}

function dumpPreview(repo: string) {
  $("title").html("MCBBS Loader - 软件源");
  let gid = GIDURL.fromString(repo);
  $(".a").removeClass("a");
  var toApply: Set<string> = new Set();
  $("div[class='bm bw0']").css("user-select", "none").html(
    `<span style='font-size:1.0rem'>正在预览软件源 ${repo}</span>` + HTML_VIEWREPO_BODY
  );
  $("#viewsrc").val(repo);
  $("#loadview").on("click", () => {
    open(
      "https://www.mcbbs.net/home.php?mod=spacecp&bbsmod=repopreview#" +
        encodeURIComponent(GIDURL.fromString($("#viewsrc").val() as string, gid).asString()),
      "_self"
    );
    dumpPreview(GIDURL.fromString($("#viewsrc").val() as string, gid).asString());
  });
  getManifest(gid, (data) => {
    if (typeof data != "object") {
      $("#all_modules").html("无法显示该软件源的预览。<br/>无效的JSON");
    } else {
      for (var [m, x] of Object.entries(data)) {
        var meta = data[m];
        meta.id = meta.id || "impossible";
        meta.name = meta.name || "Nameless";
        meta.author = meta.author || "Someone";
        meta.description = meta.description || "No description provided.";
        meta.permissions = meta.permissions || "";
        try {
          noExec(meta.id, meta.name, meta.author, meta.description, meta.permissions);
        } catch(e) {
          console.warn("%s is an illegal module which includes executable code in it's meta data");
          continue;
        }
        var isCore = meta.permissions.search("loader:core") != -1;
        var isInstalled: boolean = GMGetValue(`meta-${meta.id}`) != undefined;
        var color = isInstalled ? "#575757" : isCore ? "#ff0000" : "#5d2391";
        var installText = isInstalled ? "&nbsp;<span style='color:#575757'><b>[已安装]</b></span>" : "";
        var ele =
          `<li id='${meta.id}'>
          <div style='display:inline;'>
            <img src='${meta.icon || IMG_MCBBS}' width='50' height='50' style="vertical-align:middle;float:left;"/>
            <div style="height: 8em" class='viewrepo_mod_details'>
              &nbsp;&nbsp;
              <span style='font-size:18px;color:${color}'>
                <strong>${meta.name || "Nameless"}</strong>
              </span>
              &nbsp;&nbsp;&nbsp;
              <span id='vtag-${meta.id}' style='font-size:12px;color:#150029;'>
                ${meta.id}@${(meta.version || "1.0.0") +
                (isCore ? "&nbsp;<span style='color:#ff0000'><b>[COREMOD]</b></span>": "") +
                installText}
              </span>
              <br/>
              &nbsp;&nbsp;
              <span style='font-size:16px;color:#df307f;'>
                ${meta.author || "Someone"}
              </span>
              <br/>
              &nbsp;&nbsp;
              <span style='font-size:12px'>
                ${meta.description}
              </span>
              <input type='checkbox' class='fast-install-chk' style='float: right;' gtar='${meta.gid}'/>
              <button class='pn pnc insremote' style='float:right;' data-gtar='${meta.gid}'>
                <strong>安装/更新</strong>
              </button>
            </div>
          </div>
          <hr class='viewrepo_mod_hr'>
        </li>`;
        $("#all_modules").append(ele);
      }
      $(".insremote").on("click", e => {
        var ele = $(e.target).data("gtar") != undefined ? $(e.target) : $(e.target).parent();
        installFromGID(GIDURL.fromString(ele.data("gtar"), gid),
            st => manager.onInstall(st), r => manager.onFailure(r));
      });
      var working = false;
      $(".fast-install-chk").on("click", (e: any) => {
        if (working)
          e.preventDefault();
        else if (e.target.checked)
          toApply.add(e.target.getAttribute("gtar"));
        else
          toApply.delete(e.target.getAttribute("gtar"));
      });
      $("#apply-changes-btn").on("click", () => {
        if (!toApply.size) return;
        if (working) return;
        working = true;
        var succeed: any = [],
          fail: any = [],
          update = () => {
            resortDependency();
            if (succeed.length + fail.length == toApply.size) {
              var msg = `成功安装了 ${succeed.length} 个模块:`;
              for (var x of succeed)
                msg += `<br>&nbsp;&nbsp;&nbsp;&nbsp;${x.get("name")}`;
              if (fail.length) {
                msg += `<br>未能安装 ${fail.length} 个模块:`;
                for (var [id, err] of fail)
                  msg += `<br>&nbsp;&nbsp;&nbsp;&nbsp;${id}&nbsp;&nbsp;&nbsp;&nbsp${err}`;
                showAlert(msg, "安装失败", () => manager.dumpManager());
              }
              showSuccess(msg, "安装成功", () => manager.dumpManager());
              working = false;
            }
          };
        toApply.forEach(v => {
          installFromGID(
            GIDURL.fromString(v, gid),
            st => {
              succeed.push(st);
              update();
            },
            r => {
              fail.push([v, r]);
              update();
            }
          );
        });
        showPopper("安装中，请稍后");
      });
      $("#select-all-btn").on("click", (e) => {
        if (working) return;
        $(".fast-install-chk").each(HTMLLinkElement.prototype.click);
      });
    }
  });
}

export default { dumpPreview };
