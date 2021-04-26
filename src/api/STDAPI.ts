import {
    getWindowProperty,
    GMGetValue,
    GMSetValue,
    GMXmlhttpRequest,
    setWindowProperty,
} from "../libs/usfunc";
import $ from "jquery";
import {hasPermission} from "../libs/permissions";
import {getGM} from "../libs/native";
import {coreModEval, GIDURL} from "../libs/codeload";
import configpage from "../libs/configpage";
import {info} from "../libs/popinfo2";
import {LoaderEvent} from "./STDEVT";
import {showOfflineWindow} from "../craftmcbbs/craft-ui";
import {getCrossOriginData} from "../libs/crossorigin";
import _ from "lodash";
import {uiVersion} from "../craftmcbbs/uiv";
import {getUID, getUserDisplayName} from "../craftmcbbs/craft-user";
import {isPostPage, whoPosted} from "../craftmcbbs/craft-post";

interface InternalConfig {
    id: string;
    type: string;
    stgid: string;
    name: string;
    desc: string;
    check: (value: string) => string | undefined;
    value: string;
}

const ML_VERSION = 2;
const GM: any = getGM();
const all: any = GMGetValue("loader.all", {});

function forkAPI(id: string) {
    return new MCBBSAPI(id);
}

function assert(value: any): void {
    if (!value)
        throw new Error("Assertion failed!");
}

// 模块导入导出
setWindowProperty("MIDT", {});

/**
 * 给模块的单个的配置
 */
class Config {
    private internalConfig: any;

    constructor(internalConfig: any) {
        this.internalConfig = Object.freeze(internalConfig);
    }

    get(dval?: any) {
        return configpage.getConfigVal(this.internalConfig.id, this.internalConfig.storageId, dval);
    }

    set(val: any) {
        configpage.setConfigVal(this.internalConfig.id, this.internalConfig.storageId, val);
    }
}

/**
 * 对mcbbs的common.js的封装
 */
class Common {
    public static acquireCommon(): Common | null {
        return getWindowProperty("VERHASH") ? new Common() : null;// 因为有些页面common.js不加载
    }

    public showOfflineWindow(k: string, element: HTMLElement | Text | string, menuv?: object) {
        showOfflineWindow(k, element, menuv);
    }

    public loadExtra(script: string, callback: () => void) {
        getWindowProperty("$F")("__onExtraScriptLoaded", [callback], script);
    }
}

class MCBBSAPI {
    public id: string;
    public local: Object = {};
    public LoaderEvent = LoaderEvent;
    public user: unknown = {}
    public page: unknown = {}

    constructor(id: string) {
        this.id = id;
        let gid = GMGetValue("loader.all").gid;
        this.gid = gid ? Object.freeze(GIDURL.fromString(gid)) : GIDURL.NIL;
        if (hasPermission(id, "loader:core")) {
            this.eval = coreModEval;
            this.GM = getGM();
        } else {
            this.eval = undefined;
            this.GM = undefined;

        }
        if (hasPermission(id, "mcbbs:usercontrol")) {
            this.user = {
                getUserDisplayName,
                getUID,
            }
        } else {
            this.user = {}
        }
        if (hasPermission(id, "mcbbs:machine-operate")) {
            this.page = {
                isPostPage,
                whoPosted
            }
        } else {
            this.page = {}
        }
    }

    public getAPIVersion = getAPIVersion;
    // MCBBS V3/V2
    public getUIVersion = uiVersion();
    public download = GM.GM_download;
    public export_ = (obj: any) => {
        moduleExport(this.id, obj);
    };
    public import_ = moduleImport;
    public $ = $;
    // Lodash
    public lodash = _;

    // Polyfills
    public GM_download = GM.GM_download;
    public GM_setValue = this.storeData;
    public GM_getValue = this.getData;

    public storeData(k: string, v: any) {
        storeData(this.id + "-" + k, v);
    }

    // 这个方法参数太多，应设法减少一些
    public createConfig(
        stgid: string,
        name: string,
        type: string,
        desc: string,
        check: (arg: string) => string | undefined = (arg) => undefined,
        value: string = ""
    ) {
        assert(typeof stgid == "string");
        assert(typeof name == "string");
        assert(typeof type == "string");
        assert(typeof desc == "string");
        assert(typeof check == "function");
        assert(typeof value == "string");
        return new Config(configpage.createConfigItem(this.id, stgid, name, type, desc, check, value));
    }

    public getConfigVal(stgid: string, dval?: any) {
        assert(typeof stgid == "string");
        return configpage.getConfigVal(this.id, stgid, dval); // 之前的检查方法会造成默认值为false或者""时失败
    }

    public setConfigVal(stgid: string, value: any) {
        assert(typeof stgid == "string");
        configpage.setConfigVal(this.id, stgid, value);
    }

    public getData(k: string, dv: any) {
        assert(typeof k == "string");
        return getData(this.id + "-" + k, dv);
    }

    public mountJS(src: string | GIDURL, onsucceed: () => void = () => {
    }, onerror: (reason: string) => void = r => {
    }) {
        assert(typeof src == "string" || src instanceof GIDURL);
        if (typeof src == 'string' && !/^((file|https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/g.test(src))
            src = GIDURL.fromString(src);
        if (src == GIDURL.NIL || src == '')
            onerror("无效地址");
        if (src instanceof GIDURL)
            src = src.asString();
        getCrossOriginData(src, onerror, (msg) => {
            let script = document.createElement("script");
            script.text = msg;
            script.onload = onsucceed;
            document.head.appendChild(script);
        }, "plain");
    }

    public mountCSS(src: string | GIDURL, onsucceed: () => void = () => {
    }, onerror: (reason: string) => void = r => {
    }) {
        assert(typeof src == "string" || src instanceof GIDURL);
        if (typeof src == 'string' && !/^((file|https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/g.test(src))
            src = GIDURL.fromString(src);
        if (src == GIDURL.NIL || src == '')
            onerror("无效地址");
        if (src instanceof GIDURL)
            src = src.asString();
        getCrossOriginData(src, onerror, (msg) => {
            let style = document.createElement("style");
            style.innerHTML = msg;
            style.onload = onsucceed;
            document.head.appendChild(style);
        }, "plain");
    }

    public popInfo(msg: string) {
        assert(typeof msg == "string");
        info(`[ ${this.id} ] ` + msg);
    }

    public isModRunning(id: string) {
        assert(typeof id == "string");
        return GMGetValue("loader.sortedModuleList").indexOf(id) >= 0;
    }

    public crossOriginRequest(details: any): { abort: () => void } {
        return GMXmlhttpRequest(details);
    }

    public aquireCommon() {
        return Common.acquireCommon();
    }

    public sysNotification = GM.GM_notification;
    public GM;
    public eval;
    public GIDURL = GIDURL;
    public gid: GIDURL;
}

// 实现部分
function getAPIVersion() {
    return ML_VERSION;
}

function moduleExport(idIn: string, obj: any) {
    setWindowProperty(`module-export-${idIn}`, obj);
    notifyExport(idIn);
}

function moduleImport(id: string, callback: (arg: any) => void): boolean {
    if (getWindowProperty(`module-export-${id}`)) {
        callback(getWindowProperty(`module-export-${id}`));
    } else {
        const origin = getWindowProperty("MIDT")[id];
        if (origin) {
            getWindowProperty("MIDT")[id] = (obj: any) => {
                origin(obj);
                callback(obj);
            };
        } else {
            getWindowProperty("MIDT")[id] = callback;
        }
    }
    return GMGetValue("loader.sortedModuleList").indexOf(id) >= 0; // 让被调用者知道是否import到
}

function notifyExport(id: string) {
    for (const x in getWindowProperty("MIDT")) {
        if (x == id) {
            getWindowProperty("MIDT")[x](getWindowProperty(`module-export-${id}`));
            const m = getWindowProperty("MIDT");
            delete m[x];
            setWindowProperty("MIDT", m);
        }
    }
}

function storeData(tag: string, data: any): void {
    GMSetValue("data-" + tag, data);
}

function getData(tag: string, defaultVal: any): any {
    return GMGetValue("data-" + tag, defaultVal);
}

export {forkAPI, getAPIVersion, InternalConfig};
