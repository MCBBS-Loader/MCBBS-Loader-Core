import { GMXmlhttpRequest } from "./usfunc";

function getCrossOriginData(
  url: string,
  onerror: (msg: string) => void = () => {},
  onsuccess: (msg: any) => void = () => {},
  type: string = "plain"
) {
  return GMXmlhttpRequest({
    method: "GET",
    url: url,
    timeout: 5000,
    ontimeout: () => onerror("网络错误：连接超时"),
    onerror: () => onerror("网络错误：没有更多信息"),
    onload: (details: any) => {
      if(details.status != 200) {
        onerror(`错误：${details.status} ${details.statusText}`)
      } else {
        if(type == "json") {
          try {
            onsuccess(JSON.parse(details.responseText));
          } catch (ex) {
            onerror("JSON解析错误");
          }
        } else if(type == "plain") {
          onsuccess(details.responseText);
        }
      }
    }
  });
}
export { getCrossOriginData };