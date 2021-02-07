import {
  getWindowProperty,
  GMGetValue,
  GMSetValue,
  setWindowProperty,
} from "./usfunc";
import $ from "jquery";
import jQuery from "jquery";
import { getProperty, setProperty } from "./native";
import { success } from "./popinfo2";
function dumpConfigPage() {
  $("div[class='bm bw0']").html(
    "<span style='font-size:1.5rem'>设置中心</span>&nbsp;&nbsp;<button id='saveconfig' type='button' class='pn pnc'>" +
      "<span>保存</span></button>&nbsp;<span style='color:#df307f'>您的设置应当会自动保存，如果没有，单击此按钮来保存。</span><br/><div id='config_div'></div>"
  );
  $("#saveconfig").on("click", autoSave);
  renderAll();
}

function autoSave() {
  for (var c of getWindowProperty("CDT")) {
    var val;
    if (getProperty(c, "type") === "checkbox") {
      var tval = getProperty(
        document.getElementById(
          `confval-${getProperty(c, "id")}-${getProperty(c, "storageId")}`
        ),
        "className"
      );
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
  success("设置保存成功！");
}
function getConfigVal(idIn: string, storageIdIn: string, defaultValue: any) {
  return GMGetValue(`configstore-${idIn}-${storageIdIn}`, defaultValue);
}
function setConfigVal(idIn: string, storageIdIn: string, value: any) {
  GMGetValue(`configstore-${idIn}-${storageIdIn}`, value);
}
function renderAll() {
  for (var c of getWindowProperty("CDT")) {
    var ele = `<label style='font-size:14px' for='confval-${getProperty(
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
    )})<br/><span style='color:#df307f'>${getProperty(c, "desc")}</span>`;
    if (getProperty(c, "type") == "checkbox") {
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
    } else if (getProperty(c, "type") == "textarea") {
      ele += `</label><br><textarea id='confval-${getProperty(
        c,
        "id"
      )}-${getProperty(c, "storageId")}' style="width: 99%;"></textarea><br/>`;
    } else {
      ele += `<div style='height: 17px;'><input type='text' class='px' id='confval-${getProperty(
        c,
        "id"
      )}-${getProperty(
        c,
        "storageId"
      )}' style="background-color: white; float: right; width:50%;"/><div id='conferr-${getProperty(
        c,
        "id"
      )}-${getProperty(
        c,
        "storageId"
      )}'></div><br/>`;
    }
    $("#config_div").append(ele);
    if (getProperty(c, "type") == "checkbox") {
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
      } else if (getProperty(c, "type") != "textarea" && getProperty(c, "type") != "checkbox") {
        var element = document.getElementById(
          `confval-${getProperty(c, "id")}-${getProperty(c, "storageId")}`
        ) as any;
        element.oninput = function () {
          console.log($(this.id.replace(/^confval/, "#conferr").replace(/\./g, "\\.")));
          $(this.id.replace(/^confval/, "#conferr").replace(/\./g, "\\."))
            .html(this.check((this as any).value) || "");
        };
        element.check = getProperty(c, "check"); 
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
    autoSave();
  });
  $("textarea").on("blur", () => {
    autoSave();
  });
  $("input").on("blur", () => {
    autoSave();
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
  var check = details.get("check") || ((str: string) => true);
  var CDT = getWindowProperty("CDT") as any[];
  CDT.push({
    id: id,
    type: type,
    storageId: storageId,
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
