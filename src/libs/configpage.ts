import {
  getWindowProperty,
  GMGetValue,
  GMSetValue,
  setWindowProperty,
} from "./usfunc";
import $ from "jquery";
import jQuery from "jquery";
import { getProperty, setProperty } from "./native";
import { popinfo } from "./popinfo";
function dumpConfigPage() {
  $("div[class='bm bw0']").html(
      "<span style='font-size:1.5rem'>设置中心</span>&nbsp;&nbsp;<button id='saveconfig' type='button' class='pn pnc'>" + 
      "<span>保存</span></button><div id='config_div'></div>");
  $("#saveconfig").on("click", autoSave);
  renderAll();
}

function autoSave() {
  for (var c of getWindowProperty("CDT")) {
    var val;
    if (getProperty(c, "type") == "checkbox") {
      val = getProperty(
        document.getElementById(
          `confval-${getProperty(c, "id")}-${getProperty(c, "storageId")}`
        ),
        "checked"
      );
    } else {
      val = $(
        `[id='confval-${getProperty(c, "id")}-${getProperty(c, "storageId")}']`
      ).val();
    }

    GMSetValue(
      `configstore-${getProperty(c, "id")}-${getProperty(c, "storageId")}`,
      val
    );
  }
  popinfo("check", "设置保存成功！", false);
}
function getConfigVal(idIn: string, storageIdIn: string, defaultValue: any) {
  return GMGetValue(`configstore-${idIn}-${storageIdIn}`, defaultValue);
}
function renderAll() {
  for (var c of getWindowProperty("CDT")) {
    var ele;
    if (getProperty(c, "type") == "checkbox") {
      ele = `<input type='checkbox' id='confval-${getProperty(
        c,
        "id"
      )}-${getProperty(
        c,
        "storageId"
      )}'/><label style='font-size:14px' for='confval-${getProperty(
        c,
        "id"
      )}-${getProperty(
        c,
        "storageId"
      )}'><span style='font-size:18px;color:#5d2391'><b>${getProperty(
        c,
        "name"
      )} </b></span>(${getProperty(c, "id")}:${getProperty(
        c,
        "storageId"
      )})<br/><span style='color:#df307f'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${getProperty(
        c,
        "desc"
      )}</span></label><br/>`;
    } else {
      ele = `<label style='font-size:14px' for='confval-${getProperty(
        c,
        "id"
      )}-${getProperty(
        c,
        "storageId"
      )}'><span style='font-size:18px;color:#5d2391'><b>${getProperty(
        c,
        "name"
      )}</b></span> (${getProperty(c, "id")}:${getProperty(
        c,
        "storageId"
      )})<br/><span style='color:#df307f'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${getProperty(
        c,
        "desc"
      )}</span></label><input type='text' class='px' id='confval-${getProperty(
        c,
        "id"
      )}-${getProperty(c, "storageId")}'/><br/>`;
    }
    $("#config_div").append(ele);
    if (getProperty(c, "type") == "checkbox") {
      setProperty(
        document.getElementById(
          `confval-${getProperty(c, "id")}-${getProperty(c, "storageId")}`
        ),
        "checked",
        getConfigVal(getProperty(c, "id"), getProperty(c, "storageId"), false)
      );
    } else {
      $(
        `[id='confval-${getProperty(c, "id")}-${getProperty(c, "storageId")}']`
      ).val(
        getConfigVal(getProperty(c, "id"), getProperty(c, "storageId"), "")
      );
    }
  }
}
function createConfigItem(details: Map<string, string>) {
  var type = details.get("type") || "text";
  var id = details.get("id");
  if (!id) {
    return;
  }
  var desc = details.get("desc") || "";
  var storageId = details.get("storageId") || "impossible";
  var name = details.get("name") || "Nameless";
  var CDT = getWindowProperty("CDT") as any[];
  CDT.push({
    id: id,
    type: type,
    storageId: storageId,
    name: name,
    desc: desc,
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
export default { createMenu, dumpConfigPage, createConfigItem, getConfigVal };
