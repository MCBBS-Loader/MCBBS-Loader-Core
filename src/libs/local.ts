/*
import $ from "jquery";

import axios from "axios";
import { cmpVersion } from "./updator";
import { GMGetValue } from "./usfunc";

$.ajaxSetup({
  cache: false,
  timeout: 10000,
});
const LEAST_LOCAL_VERSION = "1.0.0";
let available: boolean = false;
let token: string;
let port_: number = 4222;
let waitingLocal: (() => void)[] = [];
let notified = false;
let pin_: string = GMGetValue("loader.local.pin", "");
function setupLocal(pin: string, port?: number) {
  port_ = port || 4222;
  pin_ = pin;
}
function notifyReady() {
  if (!notified) {
    notified = true;
    waitingLocal.forEach((fn) => {
      fn();
    });
  }
}
function checkState(callback: (state: string) => void) {
  try {
    axios
      .post(`http://localhost:${port_}/version`, {})
      .then((res) => {
        if (res.data.hasOwnProperty("version")) {
          if (cmpVersion(LEAST_LOCAL_VERSION, res.data.version)) {
            callback("OUTDATED-" + res.data.version);
          } else {
            callback("OK");
          }
        } else {
          callback("MISSING RETURN");
        }
      })
      .catch(() => {
        callback("ERROR");
      });
  } catch {
    callback("ERROR");
  }
}
function setPIN(pin: string) {
  pin_ = pin;
}
function isAvailable() {
  return available;
}
function regWaiting(fn: () => void) {
  if (!available) {
    waitingLocal.push(fn);
  } else {
    (() => {
      fn();
    })();
  }
}

function verify(callback: (state: boolean) => void) {
  try {
    axios
      .post(`http://localhost:${port_}/verify`, { pin: pin_ })
      .then((res) => {
        if (res.data.token == undefined) {
          available = false;
          callback(false);
        } else {
          token = res.data.token;
          notifyReady();
          available = true;
          callback(true);
        }
      });
  } catch {
    callback(false);
  }
}
function readFile(path: string, callback: (e: any, data: any) => void) {
  axios
    .post(`http://localhost:${port_}/new`, {
      data: { path: path },
      call: "readFile",
      token: token,
    })
    .then((res) => {
      if (res.data.reqid == undefined) {
        callback(res.data.error, undefined);
      } else {
        queryCycle(res.data.reqid, () => {
          axios
            .post(`http://localhost:${port_}/get`, {
              reqid: res.data.reqid,
              token: token,
            })
            .then((res) => {
              if (res.data.state == "FAILED") {
                callback(res.data.data || true, undefined);
              } else {
                callback(null, res.data.data);
              }
            })
            .catch(() => {
              callback("UNEXPECTED INTERRUPT", undefined);
            });
        });
      }
    })
    .catch(() => {
      callback("UNEXPECTED INTERRUPT", undefined);
    });
}
function queryCore(reqid: string, trigger: () => void) {
  let url = `http://localhost:${port_}/query`;
  let body = { token: token, reqid: reqid };
  axios
    .post(url, body)
    .then((res) => {
      if (res.data.state == "DONE" || res.data.state == "FAILED") {
        trigger();
      }
    })
    .catch(() => {});
}
function queryCycle(reqid: string, trigger: () => void) {
  let tid = setInterval(() => {
    queryCore(reqid, () => {
      clearInterval(tid);
      trigger();
    });
  }, 200);
}
export {
  checkState,
  readFile,
  regWaiting,
  verify,
  isAvailable,
  setupLocal,
  setPIN,
};
*/
