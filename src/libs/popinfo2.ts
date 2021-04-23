import $ from "jquery";
class Queue {
  dataStore: any[] = [];
  press(ele: any) {
    this.dataStore.push(ele);
  }

  release() {
    return this.dataStore.shift();
  }

  front() {
    return this.dataStore[0];
  }

  back() {
    return this.dataStore[this.dataStore.length - 1];
  }

  toString() {
    return this.dataStore.toString();
  }

  clear() {
    this.dataStore = [];
  }

  isEmpty(): boolean {
    return this.dataStore.length == 0;
  }
}

class PopMsg {
  time: number = 3000;
  icon: string = "info-circle";
  size: string = "32px";
  spark: boolean = false;
  style: string = "";
  msg: string = "";
  show(next: () => void) {
    let data =
      `<div id='_popbg' style='z-index:100;user-select:none;cursor:default;width:100%;height:50px;background-color:#02020275;position:fixed;bottom:-100px;text-align:center;color:#ffffff;${this.style}'>
        <i style='font-size:${this.size};vertical-align:middle;' id='_popicon' class='fa fa-${this.icon}'></i>
        <span style='padding-top:2px;display:inline-block;vertical-align:middle;line-height:50px;'>
          &nbsp;&nbsp;&nbsp;${this.msg}
        </span>
      </div>`;
    $("body").append(data);
    if (this.spark)
      spark($("#_popicon"), 500);
    $("#_popbg").animate({ bottom: "0" }, 300, "swing");
    setTimeout(() => $("#_popbg").animate({ bottom: "-100px" }, 300, "swing", () => {
      $("#_popbg").remove();
      next();
    }), this.time);
  }
}

function next() {
  if (MDT_EMERGENCY.front() != undefined)
    MDT_EMERGENCY.release().show(next);
  else if (MDT_HIGH.front() != undefined)
    MDT_HIGH.release().show(next);
  else if (MDT_NORMAL.front() != undefined)
    MDT_NORMAL.release().show(next);
}

function addTask(ele: PopMsg, level: string) {
  switch (level.toLocaleLowerCase()) {
    case "emergency":
      MDT_EMERGENCY.press(ele);
      next();
      break;
    case "high":
      MDT_HIGH.press(ele);
      next();
      break;
    default:
      MDT_NORMAL.press(ele);
      next();
  }
}

function spark(jq: JQuery<HTMLElement>, time: number) {
  jq.fadeOut(time, () => jq.fadeIn(time, () => spark(jq, time)));
}

let MDT_EMERGENCY = new Queue();
let MDT_HIGH = new Queue();
let MDT_NORMAL = new Queue();
function warn(msg: string) {
  let pobj = new PopMsg();
  pobj.icon = "exclamation-triangle";
  pobj.msg = msg;
  pobj.style = "background-color:#ff950085 !important;";
  pobj.time = 5000;
  addTask(pobj, "high");
}

function error(msg: string) {
  let pobj = new PopMsg();
  pobj.icon = "exclamation-circle";
  pobj.msg = msg;
  pobj.spark = true;
  pobj.style = "background-color:#88272790!important;";
  pobj.time = 10000;
  addTask(pobj, "emergency");
}

function info(msg: string) {
  let pobj = new PopMsg();
  pobj.icon = "info-circle";
  pobj.msg = msg;

  pobj.time = 3000;
  addTask(pobj, "normal");
}

function success(msg: string) {
  let pobj = new PopMsg();
  pobj.icon = "check";
  pobj.msg = msg;

  pobj.time = 3000;
  addTask(pobj, "normal");
}

export { addTask, PopMsg, warn, error, info, success };
