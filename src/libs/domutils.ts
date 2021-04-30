let cbs: any = [];

window.addEventListener("load", () => {
  for(let cb of cbs)
    cb();
  cbs = null;
})

class DOMUtils {
  public elements: any[];
  constructor(nodeList: NodeList | HTMLCollection | Array<Element>) {
    this.elements = [];
    for (let x of nodeList)
      this.elements.push(x);
  }

  static select(selector: string | Element) {
    return typeof selector == "string" ? new DOMUtils(document.querySelectorAll(selector)) : new DOMUtils([selector]);
  }

  static ban(html: string): string {
    let span = document.createElement("span");
    span.innerHTML = html;
    let flit = (ele: Element) => {
      if(["SCRIPT", "APPLET", "OBJECT", "STYLE", "LINK"].includes(ele.tagName)) {
        ele.remove();
        span.className = "banned-by-bbs-loader";
        return;
      }
      for(let i of ele.getAttributeNames()) {
        if(i.startsWith("on")){
          ele.removeAttribute(i);
          span.className = "banned-by-bbs-loader";
        }
      }
      if(ele instanceof HTMLLinkElement && ele.href?.startsWith("javascript")) { // 防javascript:xxx链接
        ele.href = "";
        span.className = "banned-by-bbs-loader";
      }
      for(let i of ele.children)
        flit(i);
    }
    flit(span);
    return span.outerHTML; // 这里使用outerHTML是为了保留class
  }

  static load(cb: () => void) {
    if(cbs) {
      cbs.push(cb);
    } else {
      setTimeout(cb, 0);
    }
    return DOMUtils;
  }

  each(func: (v: any) => void) {
    this.elements.forEach(func);
    return this;
  }

  remove() {
    this.each(e => e.remove());
    return this;
  }

  html(html?: string) {
    return typeof html == "string" ? this.each(e => e.innerHTML = html) : this.elements[0]?.innerHTML;
  }

  hasClass(name: string) {
    return this.elements[0]?.classList.contains(name);
  }

  removeClass(name: string) {
    return this.each(v => v.classList.remove(name));
  }

  addClass(name: string) {
    return this.each(v => v.classList.add(name));
  }

  css(k: string, value?: string) {
    return typeof value == "string" ? this.each(v => v.style[k] = value) : this.elements[0]?.style[k];
  }

  val(value?: string) {
    return typeof value == "string" ? this.each(v => v.value = value) : this.elements[0]?.value;
  }

  on(ev: string, cb: any) {
    return this.each(v => v.addEventListener(ev, cb));
  }

  append(value: string | HTMLElement) {
    return this.each(v => {
      if (typeof value == "string") {
        let span = document.createElement('span');
        span.innerHTML = value;
        while (span.childNodes[0])
          v.append(span.childNodes[0]);
      } else {
        v.append(value)
      }
    });
  }

  prepend(value: string | HTMLElement) {
    return this.each(v => {
      if (typeof value == "string") {
        let span = document.createElement('span');
        span.innerHTML = value;
        while (span.childNodes[span.childNodes.length - 1])
          v.prepend(span.childNodes[span.childNodes.length - 1]);
      } else {
        v.prepend(value)
      }
    });
  }

  after(value: string | HTMLElement) {
    return this.each(v => {
      if (typeof value == "string") {
        let span = document.createElement('span');
        span.innerHTML = value;
        while (span.childNodes[span.childNodes.length - 1])
          v.after(span.childNodes[span.childNodes.length - 1]);
      } else {
        v.after(value)
      }
    });
  }

  parent() {
    let collect: any = [];
    this.each(v => {
      if (v.parentElement)
        collect.push(v.parentElement);
    });
    return new DOMUtils(collect);
  }

  hide() {
    return this.css("display", "none");
  }

  show() {
    return this.css("display", "");
  }

  attr(k: string, value?: string) {
    return typeof value == "string" ? this.each(v => v.setAttribute(k, value)) : this.elements[0]?.getAttribute(k);
  }

  data(k: string, value?: string) {
    return this.attr("data-" + k, value);
  }

  foreach(cb: (i: number, v: any) => void) {
    for(let i in this.elements)
      cb(i as unknown as number, this.elements[i]);
    return this;
  }
}

function select(selector: string | Element) {
  return DOMUtils.select(selector);
}

function trim(str: string) {
  return str ? str.trim() : "";
}

export { DOMUtils, select, trim };