import {
  getWindowProperty,
  GMGetValue,
  GMSetValue,
  setWindowProperty,
} from "./usfunc";
import $ from "jquery";
import jQuery from "jquery";
import { success } from "./popinfo2";
import { LoaderEvent } from "../api/STDEVT";
function dumpConfigPage() {
  $("div[class='bm bw0']").html(
    "<span style='font-size:1.5rem'>设置中心</span>&nbsp;&nbsp;<button id='saveconfig' type='button' class='pn pnc'>" +
      "<span>保存</span></button>&nbsp;<span style='color:#df307f'>您的设置应当会自动保存，如果没有，单击此按钮来保存。</span><br/><div id='config_div'></div>"
  );
  $("#saveconfig").on("click", autoSave);
  renderAll();
}

interface ConfigItem {
  id: string;
  type: string;
  storageId: string;
  name: string;
  desc: string;
  check: (value: string) => string | undefined;
}

function autoSave() {
  for (let c of getWindowProperty("CDT") as ConfigItem[]) {
    let val;
    if (c.type === "checkbox") {
      val = document.getElementById(`confval-${c.id}-${c.storageId}`)!.classList.contains("check-square");
    } else {
      val = $(`[id='confval-${c.id}-${c.storageId}']`).val();
    }
    GMSetValue(`configstore-${c.id}-${c.storageId}`, val);
  }
  success("设置保存成功！");
}
function getConfigVal(idIn: string, storageIdIn: string, defaultValue: any) {
  return GMGetValue(`configstore-${idIn}-${storageIdIn}`, defaultValue);
}
function setConfigVal(idIn: string, storageIdIn: string, value: any) {
  GMGetValue(`configstore-${idIn}-${storageIdIn}`, value);
}
function renderAll() {
  if(LoaderEvent.emitCancelable("ConfigPagePreRender")) {
    return;
  }
  for (let c of getWindowProperty("CDT") as ConfigItem[]) {
    let ele =
      `<label style='font-size:14px' for='confval-${c.id}-${c.storageId}'>
        <span style='font-size:18px;color:#5d2391'>
          <b>${c.name} </b>
        </span>
        (${c.id}:${c.storageId})
        <br/>
        <span style='color:#df307f'>${c.desc}</span>
      </label>`;
    if (c.type == "checkbox") {
      ele =
        `<span style='font-size:14px'>
          <span style='font-size:18px;color:#5d2391'>
            <i id='confval-${c.id}-${c.storageId}' class='chkbox fa fa-check-square'></i>
            &nbsp;
            <b>${c.name}</b>
          </span>
          (${c.id}:${c.storageId})
          <br/>
          <span style='color:#df307f'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${c.desc}</span>
          <div id='conferr-${c.id}-${c.storageId}'></div></span>
          <br/>
        </span>`;
    } else if (c.type == "textarea") {
      ele +=
        `<br/>
        <div id='conferr-${c.id}-${c.storageId}'></div>
        <textarea id='confval-${c.id}-${c.storageId}' style="width: 99%;" class="loadertextconf"></textarea>
        <br/>`;
    } else {
      ele +=
        `<div style='height: 17px;'>
          <input type='text' class='px loadertextconf' id='confval-${c.id}-${c.storageId}'/>
          <div id='conferr-${c.id}-${c.storageId}'></div>
          <br/>
        </div>`;
    }
    $("#config_div").append(ele);
    if (c.type == "checkbox") {
      let faclass = getConfigVal(c.id, c.storageId, false) ? "chkbox fa fa-check-square" : "chkbox fa fa-square";
      document.getElementById(`confval-${c.id}-${c.storageId}`)!.className = faclass;
    } else {
      let value = getConfigVal(c.id, c.storageId,"");
      $(`[id='confval-${c.id}-${c.storageId}']`).val(value);
    }
    let element = document.getElementById(`confval-${c.id}-${c.storageId}`) as any;
    element.oninput = function () {
      let t = this as any;
      $(`#conferr-${c.id}-${c.storageId}`).html(
        c.check(c.type != "checkbox" ? t.value : t.className == "chkbox fa fa-check-square") || ""
      );
      if(c.type == "textarea") {
        t.rows = t.value.split("\n").length;
      }
    };
    element.oninput();
  }
  $(".chkbox").on("click", (e) => {
    let oclass = e.target.className;
    if (oclass?.includes("check-square")) {
      e.target.className = "chkbox fa fa-square";
    } else {
      e.target.className = "chkbox fa fa-check-square";
    }
    (e.target.oninput as any)();
    autoSave();
  });
  $(".loadertextconf").on("blur", autoSave);
  LoaderEvent.emit("ConfigPagePostRender");
}
function createConfigItem(
  id: string,
  stgid: string,
  name: string,
  type: string,
  desc: string,
  check: (arg: string) => string | undefined = (arg) => undefined
) {
  let CDT = getWindowProperty("CDT") as ConfigItem[];
  CDT.push({
    id: id,
    type: type,
    storageId: stgid,
    name: name,
    desc: desc,
    check: check
  });
  setWindowProperty("CDT", CDT);
}
function createMenu(): void {
  setWindowProperty("getConfig", function (id: string, sid: string) {
    return getConfigVal(id, sid, undefined);
  });

  jQuery(() => {
    $("div.appl > div.tbn > ul").prepend(
      "<li><a id='manage_config' style='cursor:pointer;'>模块选项中心</a></li>"
    );
    $("#manage_config").on("click", dumpConfigPage);
  });
}
export default { createMenu, dumpConfigPage, createConfigItem, getConfigVal, setConfigVal };
