import $ from "jquery";
let timer: Set<number> = new Set();
function popinfo(
  icon: string,
  msg: string,
  doSpark: boolean = true,
  style: string = "",
  move: number = 100,
  time: number = 500,
  size: string = "28px"
) {
  for (let i of timer.values())
    clearTimeout(i);
  // 避免 Set 迭代器混乱
  for (let i of timer.values())
    timer.delete(i);
  closepop();
  $("#_popbg").stop(true).remove();
  setTimeout(() => {
    let data =
      `<div id='_popbg' style='${style}'>
        <i style='font-size:${size};vertical-align:middle;' id='_popicon' class='fa fa-${icon}'></i>
        <span style='padding-top:2px;display:inline-block;vertical-align:middle;line-height:50px;'>
          &nbsp;&nbsp;&nbsp;${msg}
        </span>
      </div>`;
    $("body").append(data);
    if (doSpark)
      spark($("#_popicon"), time);
    $("#_popbg").animate({ bottom: "0" }, move, "swing");
  }, 200);
}

function closepop(move: number = 100, cb: () => void = () => { }) {
  $("#_popbg").animate({ bottom: "-10%" }, move, "swing", () => {
    $("#_popbg").remove();
    cb();
  });
}

function registryTimer(t: number) {
  timer.add(t);
}

function spark(jq: JQuery<HTMLElement>, time: number) {
  jq.fadeOut(time, () => jq.fadeIn(time, () => spark(jq, time)));
}

function warn(msg: string) {
  popinfo("exclamation-triangle", msg, false, "background-color:#ff950085 !important;");
}

function success(msg: string) {
  popinfo("check", msg, false);
  registryTimer(setTimeout(closepop, 4000));
}

function error(msg: string) {
  popinfo("exclamation-circle", msg, false, "background-color:#88272790!important;");
}
export { popinfo, closepop, warn, error, registryTimer, success };
