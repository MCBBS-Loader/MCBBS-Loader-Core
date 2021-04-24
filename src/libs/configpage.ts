import {
  getWindowProperty,
  GMGetValue,
  GMSetValue,
  setWindowProperty,
} from "./usfunc";
import { LoaderEvent } from "../api/STDEVT";
import { InternalConfig } from "../api/STDAPI";
import { showPopper } from "../craftmcbbs/craft-ui";
import { DOMUtils, select } from "./domutils";
function dumpConfigPage() {
  select("title").html("MCBBS Loader - 配置页面");
  select("div[class='bm bw0']").html(
    "<span style='font-size:1.5rem'>设置中心</span>&nbsp;&nbsp;" + 
    "<button id='saveconfig' type='button' class='pn pnc'>" +
    "<span>保存</span></button>&nbsp;<span style='color:#df307f'>您的设置应当会自动保存，如果没有，单击此按钮来保存。</span> " + 
    "<br/><div id='config_div'></div>"
  );
  select("#saveconfig").on("click", autoSave);
  renderAll();
}

function autoSave() {
  for (let c of getWindowProperty("CDT") as InternalConfig[])
    GMSetValue(`configstore-${c.id}-${c.stgid}`, c.type === "checkbox" ?
      document.getElementById(`confval-${c.id}-${c.stgid}`)!.classList.contains("fa-check-square") :
      select(`[id='confval-${c.id}-${c.stgid}']`).val());
  showPopper("设置保存成功！");
}

function getConfigVal(idIn: string, storageIdIn: string, defaultValue: any) {
  return GMGetValue(`configstore-${idIn}-${storageIdIn}`, defaultValue);
}

function setConfigVal(idIn: string, storageIdIn: string, value: any) {
  GMGetValue(`configstore-${idIn}-${storageIdIn}`, value);
}

function renderAll() {
  select(".a").removeClass("a");
  select("#manage_config").parent().addClass("a");
  if (LoaderEvent.emitCancelable("ConfigPagePreRender"))
    return;
  for (let c of getWindowProperty("CDT") as InternalConfig[]) {
    let ele =
      `<label style='font-size:14px' for='confval-${c.id}-${c.stgid}'>
        <span style='font-size:18px;color:#5d2391'>
          <b>${c.name} </b>
        </span>
        (${c.id}:${c.stgid})
        <br/>
        <span style='color:#df307f'>${c.desc}</span>
      </label>`;
    if (c.type == "checkbox") {
      ele =
        `<span style='font-size:14px'>
          <span style='font-size:18px;color:#5d2391'>
            <i id='confval-${c.id}-${c.stgid}' class='chkbox fa fa-check-square'></i>
            &nbsp;
            <b>${c.name}</b>
          </span>
          (${c.id}:${c.stgid})
          <br/>
          <span style='color:#df307f'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${c.desc}</span>
          <div id='conferr-${c.id}-${c.stgid}'></div></span>
          <br/>
        </span>`;
    } else if (c.type == "textarea") {
      ele +=
        `<br/>
        <div id='conferr-${c.id}-${c.stgid}'></div>
        <textarea id='confval-${c.id}-${c.stgid}' style="width: 99%;" class="loadertextconf"></textarea>
        <br/>`;
    } else if (c.type == "button") {
      ele +=
        `<br/>
        <div id='conferr-${c.id}-${c.stgid}'></div>
        <button style='float: right;' class='pn pnc' id='confval-${c.id}-${c.stgid}'>${c.value}</button>
        <br/>`
    } else {
      ele +=
        `<div style='height: 17px;'>
          <input type='text' class='px loadertextconf' id='confval-${c.id}-${c.stgid}'/>
          <div id='conferr-${c.id}-${c.stgid}'></div>
          <br/>
        </div>`;
    }
    select("#config_div").append(ele);
    if (c.type == "checkbox") {
      let faclass = getConfigVal(c.id, c.stgid, false) ? "chkbox fa fa-check-square" : "chkbox fa fa-square";
      document.getElementById(`confval-${c.id}-${c.stgid}`)!.className = faclass;
    } else {
      let value = getConfigVal(c.id, c.stgid, "");
      select(`[id='confval-${c.id}-${c.stgid}']`).val(value);
    }
    let element = document.getElementById(`confval-${c.id}-${c.stgid}`) as any;
    if (c.type == "button") {
      element.onclick = c.check;
    } else {
      element.oninput = function () {
        let t = this;
        select(`#conferr-${c.id}-${c.stgid}`).html(
          c.check(c.type != "checkbox" ? t.value : t.className == "chkbox fa fa-check-square") || ""
        );
        if (c.type == "textarea")
          t.rows = t.value.split("\n").length;
      };
      element.oninput();
    }
  }
  select(".chkbox").on("click", (e: any) => {
    e.target.className = "chkbox fa fa-" + (e.target.className?.includes("check-square") ? "check-" : "") + "square";
    (e.target.oninput as any)();
    autoSave();
  });
  select(".loadertextconf").on("blur", autoSave);
  LoaderEvent.emit("ConfigPagePostRender");
}
function createConfigItem(
  id: string,
  stgid: string,
  name: string,
  type: string,
  desc: string,
  check: (arg: string) => string | undefined = (arg) => undefined,
  value: string
) {
  let CDT = getWindowProperty("CDT") as InternalConfig[], rval = { id, type, stgid, name, desc, check, value };
  CDT.push(rval);
  setWindowProperty("CDT", CDT);
  return rval;
}

function createMenu(): void {
  setWindowProperty("getConfig", function (id: string, sid: string) {
    return getConfigVal(id, sid, undefined);
  });

  DOMUtils.load(() => {
    select("div.appl > div.tbn > ul").prepend(
      "<li><a id='manage_config' style='cursor:pointer;' " +
      "href='https://www.mcbbs.net/home.php?mod=spacecp&bbsmod=config'>模块选项中心</a></li>"
    );
    select("#manage_config").on("click", (e: any) => {
      e.preventDefault();
      dumpConfigPage();
      history.replaceState(null, null!, "https://www.mcbbs.net/home.php?mod=spacecp&bbsmod=config");
    });
  });
}

export default { createMenu, dumpConfigPage, createConfigItem, getConfigVal, setConfigVal };
