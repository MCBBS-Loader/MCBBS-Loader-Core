import {
  getWindowProperty,
  GMGetValue,
  GMSetValue,
  setWindowProperty,
} from "./usfunc";
import $ from "jquery";
import jQuery from "jquery";
import { getProperty, setProperty } from "./native";
import { closepop, popinfo, success } from "./popinfo";
function dumpConfigPage() {
  $("div[class='bm bw0']").html(
    "<span style='font-size:1.5rem'>设置中心</span>&nbsp;&nbsp;<button id='saveconfig' type='button' class='pn pnc'>" +
      "<span>保存</span></button><div id='config_div'></div>"
  );
  $("div[class='bm bw0']").css("user-select", "none");
  $("#saveconfig").on("click", autoSave);
  renderAll();
}

function autoSave() {
  for (var c of getWindowProperty("CDT")) {
    var val;
    if (["checkbox", "check", "bool"].includes(getProperty(c, "type"))) {
      var tval = getProperty(
        document.getElementById(
          `confval-${getProperty(c, "id")}-${getProperty(c, "storageId")}`
        ),
        "className"
      );
      console.log(tval);
      if (tval.includes("check-square")) {
        val = true;
      } else {
        val = false;
      }
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
  success("设置已保存");
}
function getConfigVal(idIn: string, storageIdIn: string, defaultValue: any) {
  return GMGetValue(`configstore-${idIn}-${storageIdIn}`, defaultValue);
}
function renderAll() {
  for (var c of getWindowProperty("CDT")) {
    var ele;
    switch (getProperty(c, "type")) {
      case "checkbox":
      case "check":
      case "bool":
        ele = `
        <span style='font-size:14px'><span style='font-size:18px;color:#5d2391'><i id='confval-${getProperty(
          c,
          "id"
        )}-${getProperty(
          c,
          "storageId"
        )}' class='chkbox fa fa-check-square'></i>&nbsp;<b>${getProperty(
          c,
          "name"
        )} </b></span>(${getProperty(c, "id")}:${getProperty(
          c,
          "storageId"
        )})<br/><span style='color:#df307f'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${getProperty(
          c,
          "desc"
        )}</span></span>
        <br/>`;
        break;
      case "line":
      case "txt":
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
        )})<br/><span style='color:#df307f'>${getProperty(
          c,
          "desc"
        )}</span></label><br/><input type='text' style='width:90%' class='px' id='confval-${getProperty(
          c,
          "id"
        )}-${getProperty(c, "storageId")}'/><br/>`;
        break;
      case "textarea":
      case "text":
      case "multiline":
      case "longtxt":
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
        )})<br/><span style='color:#df307f'>${getProperty(
          c,
          "desc"
        )}</span></label><textarea id='confval-${getProperty(
          c,
          "id"
        )}-${getProperty(c, "storageId")}' placeholder='为设置项 ${getProperty(
          c,
          "id"
        )}-${getProperty(
          c,
          "storageId"
        )} 设定合适的值……' style='font-family:"Fira Code","Courier New",monospace !important;background-color:#fbf2db;width:90% !important;height:100px !important;overflow:auto;word-break:break-all;resize:vertical !important;' class='pt'></textarea><br/>`;
        break;
      default:
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
        break;
    }
    $("#config_div").append(ele);
    if (["checkbox", "check", "bool"].includes(getProperty(c, "type"))) {
      var faclass = "chkbox fa fa-square";
      if (
        getConfigVal(getProperty(c, "id"), getProperty(c, "storageId"), false)
      ) {
        faclass = "chkbox fa fa-check-square";
      }
      setProperty(
        document.getElementById(
          `confval-${getProperty(c, "id")}-${getProperty(c, "storageId")}`
        ),
        "className",
        faclass
      );
    } else {
      var value = getConfigVal(
        getProperty(c, "id"),
        getProperty(c, "storageId"),
        ""
      );
      var fld = $(
        `[id='confval-${getProperty(c, "id")}-${getProperty(c, "storageId")}']`
      ).val(value);
      if (getProperty(c, "type") == "textarea") {
        // 使得textarea的行数动态增长，这样就可以避免滚动
        fld.prop("rows", value.split("\n").length);
        // jq似乎没有合适的api绑定这个事件？
        document.getElementById(
          `confval-${getProperty(c, "id")}-${getProperty(c, "storageId")}`
        )!.oninput = function () {
          (this as any).rows = (this as any).value.split("\n").length;
        };
      }
    }
  }
  $(".chkbox").on("click", (e) => {
    var oclass = $(e.target).attr("class");
    if (oclass?.includes("check-square")) {
      $(e.target).attr("class", "chkbox fa fa-square");
    } else {
      $(e.target).attr("class", "chkbox fa fa-check-square");
    }
  });
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
