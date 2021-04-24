import { getAPIVersion } from "../api/STDAPI";
import {
  addModule,
  deleteModule,
  getDependencyError,
  getTmpDisabled,
  GIDURL,
  installFromGID,
  installFromUrl,
  isDependencySolved,
  isDirty,
  markDirty,
  resortDependency,
} from "./codeload";
import { HTML_MANAGER_FOOTER } from "./static";
import { checkUpdate } from "./updator";
import { GMGetValue, GMSetValue, setWindowProperty } from "./usfunc";
import { showAlert, showDialogFull, showPopper } from "../craftmcbbs/craft-ui";
import { getCrossOriginData } from "./crossorigin";
import configpage from "./configpage";
import { DOMUtils, select } from "./domutils";

const activeChecking: Map<string, string> = new Map();
function createManageHtml(meta: any, isCore: boolean, color: string) {
  return `<li id='${meta.id}'>
    <div style='display:inline;'>
      <img src='${meta.icon || ""}' width='50' height='50' style="vertical-align:middle;float:left;"/>
      <div style="height: 8em">
        &nbsp;&nbsp;
        <span style='font-size:18px;color:${color}'>
          <strong>${meta.name || "Nameless"}</strong>
        </span>
        &nbsp;&nbsp;&nbsp;
        <span id='vtag-${meta.id}' style='font-size:12px;color:#150029;'>
          ${meta.id || "loader.nameless"}@${(meta.version || "1.0.0") +
    (isCore ? "&nbsp;<span style='color:#ff0000'><b>[COREMOD]</b></span>" : "")}
          <span style='color:#df307f;${getTmpDisabled().includes(meta.id) ? "" : "display: none;"}'>
            [依赖关系原因停用]
          </span>
        </span>
        <br/>
          &nbsp;&nbsp;
        <span style='font-size:16px;color:#df307f;'>${meta.author || "Someone"}</span>
        <br/>
        &nbsp;&nbsp;
        <span style='font-size:12px'>${meta.description}</span>
        <div style="float: right;">
          <button type='button' class='pn pnc remove' onclick='window.notifyUninstall("${meta.id}")'>
            <strong>删除模块</strong>
          </button>
          &nbsp;&nbsp;
          <button type='button' class='pn pnc onoff' onclick='window.notifyOnOff("${meta.id}")'>
            <strong>${GMGetValue("loader.all", {})[meta.id] ? "禁用" : "启用"}</strong>
          </button>
          <button type='button' class='pn pnc showsrc' data-mlsource='${meta.id}'>
            <strong>查看源代码</strong>
          </button>
        </div>
      </div>
    </div>
  </li>`;
}

function createBtn(): void {
  DOMUtils.load(() => {
    select("ul.user_info_menu_btn").append(
      "<li><a href='https://www.mcbbs.net/home.php?mod=spacecp&bbsmod=manager'>MCBBS 模块管理</a></li>"
    );
  });
}

function createMenu(): void {
  if (window.location.href.startsWith("https://www.mcbbs.net/home.php?mod=spacecp")) {
    DOMUtils.load(() => {
      select("div.appl > div.tbn > ul").prepend(
        "<li><a id='loader_manager' href='https://www.mcbbs.net/home.php?mod=spacecp&bbsmod=manager'" +
        "style='cursor:pointer;'>模块管理</a></li>"
      );
      select('#loader_manager').on('click', (e: any) => {
        e.preventDefault();
        dumpManager();
        // null后面加!是为了让编译器闭嘴
        history.replaceState(null, null!, "https://www.mcbbs.net/home.php?mod=spacecp&bbsmod=manager");
      })
    });
    configpage.createMenu();
  }
}

const isCoreModWarn: string =
  "这是一个 CoreMod，它拥有和 MCBBS Loader 一样的权限，在使用时，请注意安全。";

function onInstall(st: Map<string, string>) {
  activeChecking.delete(st.get("id")!);
  resortDependency();
  dumpManager();
  select("#install_base64").val(GMGetValue(`code-${st.get("id")}`, ""));
  let isCore = (st.get("permissions")?.search("loader:core") as any) >= 0;
  showDialogFull({
    msg:
      `${st.get("name")}已成功安装在您的 MCBBS 上。
      <br/>  
      以下是有关本次安装的详情：
      <br/>  
      &nbsp;&nbsp;软件包类型：Mod
      <br/>
      &nbsp;&nbsp;软件包 ID：${st.get("id") || "未知"}
      <br/>
      &nbsp;作者：${st.get("author") || "未知"}
      ${isCore ? "<br/>" + isCoreModWarn : ""}
      <br/>
      &nbsp;&nbsp版本：${st.get("version")}`,
    title: "安装简报",
    mode: "right",
  });
  if (isCore) {
    showPopper(
      "您安装了一个 CoreMod，请当心，CoreMod 拥有很高的权限，可能会破坏 MCBBS Loader。如果这不是您安装的，请移除它：" +
      st.get("id") +
      "。"
    );
  } else {
    showPopper("成功安装了模块");
  }
}

// 安装失败时的动作
function onFailure(st: string) {
  showAlert(st, "安装失败", () => { });
}

function dumpManager() {
  select("title").html("MCBBS Loader - 管理页面");
  select(".a").removeClass("a");
  setTimeout(() => select("#loader_manager").parent().addClass("a"), 50);
  let emsg = getDependencyError().replace(/\n/g, "<br>");
  DOMUtils.load(() => {
    select("div[class='bm bw0']").css("user-select", "none");
    select("div[class='bm bw0']").html(
      `<span style='font-size:1.5rem'>模块管理&nbsp;&nbsp;&nbsp;版本&nbsp;${getAPIVersion()}
        <span style="font-size: 0.8em;color:red" >${!isDependencySolved() ? "<br>依赖关系未解决" : ""}</span>
        <span style="font-size: 0.8em;color: brown" >${isDirty() ? "<br>当前的设置需要刷新才能生效" : ""}</span>
      </span>
      <br/>
      <hr/>
      <span style='${!isDependencySolved() ? "" : "display:none;"}font-size:1rem;'>错误</span>
      <div id='deperr' style='overflow:auto;color:#ff0000;${!isDependencySolved() ? "" : "display:none;"}'>
        ${emsg}
      </div>
      <hr style='${!isDependencySolved() ? "" : "display:none;"}'/>` +
      HTML_MANAGER_FOOTER
    );
    select("#use_mloader").on("click", () => select("#install_uno").val("MCBBS-Loader:仓库名:模块 ID:main"));
    select("#use_cv").on("click", () =>
      select("#install_uno").val("CaveNightingale:CaveNightingale-MCBBS-Modules:模块 ID:master"));
    select("#use_mext").on("click", () => select("#install_uno").val("MCBBS-Loader:Integration-Motion:模块 ID:main"));

    select("#debugmode").on("click", () => {
      if (select("#debugmode").attr("debug") == "false") {
        select("#debugmode").attr("debug", "true");
        select("#install_base64").show();
        select("#install_uno").hide();
        select(".srcc").hide();
      } else {
        select("#debugmode").attr("debug", "false");
        select("#install_base64").hide();
        select("#install_uno").show();
        select(".srcc").show();
      }
    });

    setWindowProperty("notifyUninstall", (id: string) => {
      deleteModule(id, () => {
        resortDependency();
        dumpManager();
        showPopper("成功移除了模块");
      });
    });
    setWindowProperty("notifyOnOff", (id: string) => {
      let all = GMGetValue("loader.all", {});
      all[id] = !all[id];
      GMSetValue("loader.all", all);
      markDirty();
      resortDependency();
      dumpManager();
    });
    select("#install").on("click", () => {
      let src = select("#debugmode").attr("debug") == "true" ? "#install_base64" : "#install_uno";
      let str = select(src).val()?.toString() || "";

      try {
        let st = addModule(atob(str));
        if (typeof st != "string") {
          onInstall(st);
        } else {
          let isUrlRegex = /^((file|https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/g;
          if (isUrlRegex.test(str)) {
            showPopper("正在获取数据……");
            try {
              getCrossOriginData(str, onFailure, (data: any) => {
                let st = addModule(data);
                if (typeof st != "string")
                  onInstall(st);
                else
                  onFailure(st);
              });
            } catch {
              let st = addModule(str);
              if (typeof st != "string")
                onInstall(st);
              else
                installFromGID(GIDURL.fromString(str), onInstall, onFailure);
            }
          } else {
            let st = addModule(str);
            if (typeof st != "string")
              onInstall(st);
            else
              installFromGID(GIDURL.fromString(str), onInstall, onFailure);
          }
        }
      } catch {
        let isUrlRegex = /^((file|https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/g;
        if (isUrlRegex.test(str)) {
          showPopper("正在获取数据……");
          try {
            getCrossOriginData(str, onFailure, (data: any) => {
              let st = addModule(data);
              if (typeof st != "string")
                onInstall(st);
              else
                onFailure(st);
            });
          } catch {
            let st = addModule(str);
            if (typeof st != "string")
              onInstall(st);
            else
              installFromGID(GIDURL.fromString(str), onInstall, onFailure);
          }
        } else {
          let st = addModule(str);
          if (typeof st != "string")
            onInstall(st);
          else
            installFromGID(GIDURL.fromString(str), onInstall, () => onFailure(`无效 ID 或网络错误，所有安装途径均失败`));
        }
      }
    });
    let all_modules = GMGetValue("loader.all", {});
    for (let m of Object.entries(all_modules)) {
      let meta = GMGetValue("meta-" + m[0], { id: "impossible" });
      let isCore = meta.permissions.search("loader:core") != -1;
      let ele = createManageHtml(meta, isCore, isCore ? "#ff0000" : "#5d2391");
      select("#all_modules").append(ele);
    }
    select(".showsrc").on("click", (e: { target: string; }) => {
      if (select("#debugmode").attr("debug") == "false") {
        select("#debugmode").attr("debug", "true");
        select("#install_base64").show();
        select("#install_uno").hide();
        select(".srcc").hide();
      }
      let id = select(e.target).data("mlsource") || select(e.target).parent().data("mlsource");
      if (!id)
        return;
      select("#install_base64").val(GMGetValue(`code-${id}`, ""));
    });
    select("#all_modules > li").foreach((_i, e) => {
      let id = select(e).attr("id") || "loader.impossible";
      let meta: any = GMGetValue(`meta-${id}`);

      if (activeChecking.get(id) != meta.version) {
        activeChecking.set(id, meta.version);
        checkUpdate(meta, (state, ov, nv) => {
          if (activeChecking.get(id) != meta.version)
            return;
          activeChecking.delete(id);
          let gtxt;
          let shouldUpdate = false;
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
          let oh = select(`[id='vtag-${meta.id}']`).html();

          oh = `${oh}${shouldUpdate ? "&nbsp;->&nbsp;" + nv : ""}&nbsp;${gtxt}`;

          select(`[id='vtag-${meta.id}']`).html(oh);
          if (shouldUpdate)
            select(`[id='vtag-${meta.id}']`).parent().append(
              `<button type='button' style='float:right' class='pn pnc update' data-mlurl='${state}'>
                <strong>更新模块</strong>
              </button>`
            );
          select(".update").on("click", (e: { target: string; }) => {
            let url = select(e.target).data("mlurl") || select(e.target).parent().data("mlurl");
            if (!url)
              return;
            if (select(e.target).data("mlurl"))
              select(e.target).remove();
            else
              select(e.target).parent().remove();
            markDirty();
            installFromUrl(
              url,
              () => {
                dumpManager();

                let oh = select(`[id='vtag-${meta.id}']`).html();

                oh = oh.replace(
                  `<span style="color:#ffaec8"><b>[有可用更新]</b></span>`,
                  `<span style='color:#df307f'><b>[已更新]</b></span>`
                );
                select(`[id='vtag-${meta.id}']`).html(oh);
              },
              () => {
                let oh = select(`[id='vtag-${meta.id}']`).html();
                oh = oh.replace(
                  `<span style="color:#ffaec8"><b>[有可用更新]</b></span>`,
                  `<span style='color:#ec1c24'><b>[更新失败]</b></span>`
                );
                select(`[id='vtag-${meta.id}']`).html(oh);
              },
              GIDURL.fromString(meta.gid)
            );
            showPopper("已尝试更新，更新效果在更新完成后刷新页面才会显示。");
          });
        });
      }
    });
  });
}

export default { createBtn, createMenu, dumpManager, onInstall, onFailure };
