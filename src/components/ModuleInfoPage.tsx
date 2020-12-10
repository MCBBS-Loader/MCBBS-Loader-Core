import React from "react";
import { Component } from "react";
import { getProperty } from "../libs/native";
import { getWindowProperty } from "../libs/usfunc";

class ModuleInfoPage extends Component {
  onOnOff() {
    getWindowProperty("notifyOnOff")(getProperty(this.props, "meta")["id"]);
  }
  onUninstall() {
    getWindowProperty("notifyUninstall")(getProperty(this.props, "meta")["id"]);
  }
  render() {
    var meta = getProperty(this.props, "meta");
    return (
      <div style="display:inline;">
        <img
          src=""
          width="50"
          height="55"
          style="vertical-align:middle;float:left;"
        />
        <div style="height: 8em">
          &nbsp;&nbsp;
          <span style="font-size:18px;color:#5d2391">
            <strong>${meta.name}</strong>
          </span>
          &nbsp;&nbsp;&nbsp;
          <span style="font-size:12px;color:#150029;">
            ${meta.id}@${meta.version}
          </span>
          <br />
          &nbsp;&nbsp;
          <span style="font-size:16px;color:#df307f;">${meta.author}</span>
          <br />
          &nbsp;&nbsp;
          <span style="font-size:12px">${meta.description}</span>
          <button
            style="float:right;"
            type="button"
            className="pn pnc remove"
            onClick={this.onUninstall}
          >
            <strong>删除模块</strong>
          </button>
          &nbsp;&nbsp;
          <button
            style="float:right;"
            type="button"
            className="pn pnc onoff"
            onClick={this.onOnOff}
          >
            <strong>禁用</strong>
          </button>
        </div>
      </div>
    );
  }
}

export { ModuleInfoPage };
