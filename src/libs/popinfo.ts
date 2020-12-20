import $ from "jquery";

function popinfo(
  icon: string,
  msg: string,
  doSpark: boolean = true,
  style: string = "",
  move: number = 100,
  time: number = 500,
  size: string = "28px"
) {
  closepop();
  setTimeout(() => {
    var data = `<div id='_popbg' style='${
      style
    }user-select:none;cursor:default;width:100%;height:-50px;background-color:#02020275;position:fixed;bottom:-50px;text-align:center;color:#ffffff;'><i style='font-size:${
      size
    };vertical-align:middle;' id='_popicon' class='fa fa-${icon}'></i><span style='padding-top:2px;display:inline-block;vertical-align:middle;line-height:50px;'>&nbsp;&nbsp;&nbsp;${msg}</span></div>`;
    $("body").append(data);
    if (doSpark) {
      spark($("#_popicon"), time);
    }
    $("#_popbg").animate({ bottom: "0" }, move, "swing");
  }, 110);
}
function closepop(move: number = 100, cb: () => void = () => {}) {
  $("#_popbg").animate({ bottom: "-5%" }, move, "swing", () => {
    $("#_popbg").remove();
    cb();
  });
}
function spark(jq: JQuery<HTMLElement>, time: number) {
  jq.fadeOut(time, () => {
    jq.fadeIn(time, () => {
      spark(jq, time);
    });
  });
}

export { popinfo, closepop };
