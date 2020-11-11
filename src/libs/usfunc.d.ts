declare function GMAddStyle(css: string): HTMLElement;
declare function GMDeleteValue(name: string): void;
declare function GMListValues(): string[];
declare function GMSetValue(name: string, value: any): void;
declare function GMGetValue(name: string, defaultValue: any): any;
declare function GMLog(msg: any): void;
declare function GMGetResourceText(name: string): string;
declare function GMGetResourceURL(name: string): string;
declare function GMNotification(
  text: string,
  title: string,
  image: string,
  onclick: () => void
): void;
declare function GMSetClipBoard(data: string, info: string): void;
declare function GMDownload(url: string, name: string): void;
declare function getWindowProperty(key: string): any;
declare function setWindowProperty(key: string, value: any): void;
export {
  GMAddStyle,
  GMDeleteValue,
  GMListValues,
  GMSetValue,
  GMGetValue,
  GMLog,
  GMGetResourceText,
  GMGetResourceURL,
  GMNotification,
  GMSetClipBoard,
  GMDownload,
  setWindowProperty,
  getWindowProperty,
};
