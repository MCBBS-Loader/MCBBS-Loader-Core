/*
import $ from "jquery";
import { GMGetValue, GMSetValue } from "./usfunc";
import { info } from "./popinfo2";
import { isAvailable, setPIN } from "./local";
function dumpLocalMenu() {
  $(() => {
    $("div.appl > div.tbn > ul").prepend(
      "<li><a id='manage_local' style='cursor: pointer'>本地对接选项</a></li>"
    );
    $("#manage_local").on("click", () => {
      $("div[class='bm bw0']").html(
        `<span style='font-size:1.5rem'>本地对接程序选项</span>&nbsp;&nbsp;<br/><hr/><span style="color:#5d2391;font-size: 16px"><b>状态</b></span>
<br/><span id="local_state" style="color: #df307f">检测中……</span><br/><hr/><span style="color:#5d2391;font-size: 16px"><b>PIN</b></span>
<br/><input type='password' class='px' id='pinbox' style="background-color: white;width:50%;" placeholder="输入新的 PIN 用于连接"/>&nbsp;<button id='savepin' type='button' class='pn pnc'><span>保存</span></button>`
      );
      if (!isAvailable()) {
        $("#local_state").html(
          "<i class='fa fa-times'></i> 连接本地对接程序时出现失误"
        );
      } else {
        $("#local_state").html(
          "<i class='fa fa-check'></i> 本地对接程序正常运行中"
        );
      }
      $("#savepin").on("click", () => {
        let newpin = $("#pinbox").val() || GMGetValue("loader.local.pin") || "";
        GMSetValue("loader.local.pin", newpin);
        $("#pinbox").val("");
        setPIN(newpin);
        info("已更新 PIN");
      });
    });
  });
}
export default { dumpLocalMenu };
*/
