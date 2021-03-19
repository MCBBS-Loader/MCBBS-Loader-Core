class LoaderEvent extends Event{
  constructor(name, detail, cancelable = false) {
    super(name, { bubbles: true, cancelable: cancelable });
    this.name = name;
    for(let [k, v] of Object.entries(detail)) {
      this[k] = v;
    }
  }

  static emit(name, detail = {}) {
    document.dispatchEvent(new LoaderEvent(name, detail));
  }

  static emitCancelable(name, detail = {}) {
    let event = new LoaderEvent(name, detail, true);
    document.dispatchEvent(event);
    return event.defaultPrevented;
  }
}
function loadEvents() {
  (async () => {
    if(typeof unsafeWindow.ajaxpost != "undefined") {
      const __ajaxpost = unsafeWindow.ajaxpost;
      unsafeWindow.ajaxpost = (formid, showid, waitid, showidclass, submitbtn, recall) => {
        if(LoaderEvent.emitCancelable("DiscuzAjaxPrePost", {formid, showid, waitid, showidclass, submitbtn, recall})) {
          return;
        }
        let relfunc = () => {
          if (typeof recall == "function") {
            recall();
          } else {
            eval(recall);
          }
          LoaderEvent.emit("DiscuzAjaxPostPost", {formid, showid, waitid, showidclass, submitbtn, recall});
        };
        __ajaxpost(formid, showid, waitid, showidclass, submitbtn, relfunc);
      };
    }

    if(typeof unsafeWindow.ajaxget != "undefined") {
      const __ajaxget = unsafeWindow.ajaxget;
      unsafeWindow.ajaxget = (url, showid, waitid, loading, display, recall) => {
        if(LoaderEvent.emitCancelable("DiscuzAjaxPreGet", {url, showid, waitid, loading, display, recall})) {
          return;
        }
        let relfunc = () => {
          if (typeof recall == "function") {
            recall();
          } else {
            eval(recall);
          }
          LoaderEvent.emit("DiscuzAjaxPostGet", {url, showid, waitid, loading, display, recall});
        };
        __ajaxget(url, showid, waitid, loading, display, relfunc);
      };
    }

    if(typeof unsafeWindow.previewThread != "undefined") {
      let __previewThread = unsafeWindow.previewThread;
      unsafeWindow.previewThread = (tid, tbody) => {
        if(LoaderEvent.emitCancelable("ToggleThreadPreview", { tid, tbody})) {
          return;
        }
        __previewThread(tid, tbody);
      }
    }

    if(typeof unsafeWindow.showWindow != "undefined") {
      let __showWindow = unsafeWindow.showWindow;
      unsafeWindow.showWindow = (win, url, method, cache, menuv) => {
        if(LoaderEvent.emitCancelable("WindowPreLoad", { win, url, method, cache, menuv })) {
          return;
        }
        __showWindow(win, url, method, cache, menuv);
      }
    }

    if(typeof unsafeWindow.showMenu != "undefined") {
      let __showMenu = unsafeWindow.showMenu;
      unsafeWindow.showMenu = (detail) => {
        if(LoaderEvent.emitCancelable("MenuPreShow", { detail })) {
          return;
        }
        __showMenu(detail);
        LoaderEvent.emit("MenuPostShow", { detail });
      }
    }

    if(typeof unsafeWindow.hideMenu != "undefined") {
      let __hideMenu = unsafeWindow.hideMenu;
      unsafeWindow.hideMenu = (attr, mtype) => {
        if(LoaderEvent.emitCancelable("MenuPreHide", { attr, mtype })) {
          return;
        }
        __hideMenu(attr, mtype);
        LoaderEvent.emit("MenuPostHide", { attr, mtype});
      }
    }
  })();
}

export { loadEvents, LoaderEvent };