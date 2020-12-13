import $ from "jquery";

function popinfo(
  icon: string,
  msg: string,
  doSpark?: boolean,
  style?: string,
  move?: number,
  time?: number,
  size?: string
) {
  closepop();
  if (doSpark == undefined) {
    doSpark = true;
  }
  var ctime = time || 500;
  var data = `<div id='_popbg' style='${
    style || ""
  }user-select:none;cursor:default;width:100%;height:-50px;background-color:#02020275;position:fixed;bottom:-50px;text-align:center;color:#ffffff;'><i style='font-size:${
    size || "28px"
  };vertical-align:middle;' id='_popicon' class='fa fa-${icon}'></i><span style='padding-top:2px;display:inline-block;vertical-align:middle;line-height:50px;'>&nbsp;&nbsp;&nbsp;${msg}</span></div>`;
  $("body").append(data);
  if (doSpark) {
    spark($("#_popicon"), ctime);
  }
  $("#_popbg").animate({ bottom: "0" }, move || 100, "swing");
}
function closepop(move?: number) {
  $("#_popbg").animate({ bottom: "-5%" }, move || 100, "swing", () => {
    $("#_popbg").remove();
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
