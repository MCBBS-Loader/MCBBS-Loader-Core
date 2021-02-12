declare function GMDeleteValue(name: string): void;
declare function GMSetValue(name: string, value: any): void;
declare function GMGetValue(name: string, defaultValue?: any): any;
declare function GMLog(msg: any): void;
declare function getWindowProperty(key: string): any;
declare function setWindowProperty(key: string, value: any): void;
export {
  GMDeleteValue,
  GMSetValue,
  GMGetValue,
  GMLog,
  setWindowProperty,
  getWindowProperty,
};
