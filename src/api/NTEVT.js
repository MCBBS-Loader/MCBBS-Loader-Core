
function loadNTEVT() {
  (async () => {
    const removeHandler = (r) => {
      switch (r.target.nodeName) {
        case "TBODY":
          if (typeof r.target.id != "undefined") {
            if (r.target.id.lastIndexOf("normalthread_") >= 0) {
              r.target.dispatchEvent(
                new CustomEvent("ThreadPreviewClosed", { bubbles: true })
              );
            }
          }
          break;
        case "DIV":
          if (
            typeof r.target.id != "undefined" &&
            r.target.id.lastIndexOf("threadPreview_") >= 0
          ) {
            if (
              r.removedNodes[0].nodeName == "SPAN" &&
              r.removedNodes[0].innerText == " 请稍候..."
            ) {
              r.target.dispatchEvent(
                new CustomEvent("ThreadPreviewOpened", { bubbles: true })
              );
            }
          } else if (
            r.removedNodes.length >= 3 &&
            r.target.id.lastIndexOf("post_") >= 0
          ) {
            if (
              r.removedNodes[0].nodeName == "A" &&
              r.removedNodes[0].name == "newpost" &&
              r.removedNodes[0].parentNode != null
            ) {
              r.target.dispatchEvent(
                new CustomEvent("ThreadFlushStarted", { bubbles: true })
              );
            }
          } else if (r.target.id == "append_parent") {
            if (r.removedNodes[0].nodeName == "DIV") {
              if (r.removedNodes[0].id == "fwin_rate") {
                r.target.dispatchEvent(
                  new CustomEvent("RateWindowClosed", { bubbles: true })
                );
              } else if (r.removedNodes[0].id == "fwin_reply") {
                r.target.dispatchEvent(
                  new CustomEvent("ReplyWindowClosed", { bubbles: true })
                );
              } else if (
                typeof r.removedNodes[0].id != "undefined" &&
                r.removedNodes[0].id.lastIndexOf("fwin_miscreport") >= 0
              ) {
                r.target.dispatchEvent(
                  new CustomEvent("ReportWindowClosed", { bubbles: true })
                );
              }
            }
          }
          break;
      }
    };
    const addHandler = (r) => {
      switch (r.target.nodeName) {
        case "DIV":
          if (typeof r.target.id != "undefined") {
            if (r.target.id.lastIndexOf("threadPreview_") >= 0) {
              if (
                r.addedNodes[0].nodeName == "SPAN" &&
                r.addedNodes[0].innerText == " 请稍候..."
              ) {
                r.target.dispatchEvent(
                  new CustomEvent("ThreadPreviewPreOpen", { bubbles: true })
                );
              }
            } else if (
              r.addedNodes.length >= 3 &&
              r.target.id.lastIndexOf("post_") >= 0
            ) {
              if (
                r.addedNodes[0].nodeName == "A" &&
                r.addedNodes[0].name == "newpost" &&
                r.addedNodes[0].parentNode != null
              ) {
                r.target.dispatchEvent(
                  new CustomEvent("ThreadFlushFinished", { bubbles: true })
                );
              }
            } else if (r.target.id == "append_parent") {
              if (r.addedNodes[0].nodeName == "DIV") {
                if (r.addedNodes[0].id == "fwin_rate") {
                  r.addedNodes[0].dispatchEvent(
                    new CustomEvent("RateWindowPreOpen", { bubbles: true })
                  );
                } else if (r.addedNodes[0].id == "fwin_reply") {
                  r.addedNodes[0].dispatchEvent(
                    new CustomEvent("ReplyWindowPreOpen", { bubbles: true })
                  );
                } else if (
                  typeof r.addedNodes[0].id != "undefined" &&
                  r.addedNodes[0].id.lastIndexOf("fwin_miscreport") >= 0
                ) {
                  r.addedNodes[0].dispatchEvent(
                    new CustomEvent("ReportWindowPreOpen", { bubbles: true })
                  );
                }
              }
            } else if (r.target.id === "") {
              if (
                r.target.parentElement != null &&
                r.target.parentElement == "postlistreply"
              ) {
                r.target.dispatchEvent(
                  new CustomEvent("NewReplyAppended", { bubbles: true })
                );
              }
            }
          }
          break;
        case "A":
          if (
            r.addedNodes[0].nodeName == "#text" &&
            typeof tid == "undefined"
          ) {
            if (r.addedNodes[0].nodeValue == "正在加载, 请稍后...") {
              r.target.dispatchEvent(
                new CustomEvent("ThreadsListLoadStart", { bubbles: true })
              );
            } else if (r.addedNodes[0].nodeValue == "下一页 »") {
              r.target.dispatchEvent(
                new CustomEvent("ThreadsListLoadFinished", { bubbles: true })
              );
            }
          }
          break;
        case "TD":
          if (
            r.target.id == "fwin_content_rate" &&
            r.addedNodes[0].nodeName == "DIV" &&
            r.addedNodes[0].id == "floatlayout_topicadmin"
          ) {
            r.target.dispatchEvent(
              new CustomEvent("RateWindowOpened", { bubbles: true })
            );
          }
          if (
            r.target.id == "fwin_content_reply" &&
            r.addedNodes[0].nodeName == "H3" &&
            r.addedNodes[0].id == "fctrl_reply"
          ) {
            r.target.dispatchEvent(
              new CustomEvent("ReplyWindowOpened", { bubbles: true })
            );
          }
          if (
            typeof r.target.id != "undefined" &&
            r.target.id.lastIndexOf("fwin_content_miscreport") >= 0 &&
            r.addedNodes[0].nodeName == "H3" &&
            r.addedNodes[0].id.lastIndexOf("fctrl_miscreport") >= 0
          ) {
            r.target.dispatchEvent(
              new CustomEvent("ReportWindowOpened", { bubbles: true })
            );
          }
          break;
      }
    };
    const mainHandler = (r) => {
      if (r.type == "childList") {
        if (r.addedNodes.length > 0) {
          addHandler(r);
        }
        if (r.removedNodes.length > 0) {
          removeHandler(r);
        }
      }
    };
    let O = new MutationObserver((e) => {
      for (let record of e) {
        mainHandler(record);
      }
    });
    document.addEventListener("DOMContentLoaded", () => {
      if(!unsafeWindow.MExt) {
        O.observe(document.body, { childList: true, subtree: true });
      }
    });
    addEventListener("DiscuzAjaxPostPost", () => 
      document.dispatchEvent(new CustomEvent("DiscuzAjaxPostFinished", { bubbles: true })));
    addEventListener("DiscuzAjaxPostGet", () => 
      document.dispatchEvent(new CustomEvent("DiscuzAjaxGetFinished", { bubbles: true })));
  })();
}
export { loadNTEVT };
