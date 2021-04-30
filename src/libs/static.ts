// 本文件用于集与程序逻辑关系不密切的静态内容，例如图片、长段HTML文本
const IMG_MCBBS = "https://attachment.mcbbs.net/data/myattachment/forum/202104/30/181947s2ofgj3spsfj1pss.png";

const HTML_MANAGER_FOOTER = 
  `<span style='font-size:1rem'>已安装的模块</span>
  <br/>
  <div style='overflow:auto;'>
    <ul id='all_modules'></ul>
  </div>
  <hr/>
  <span style='font-size:1rem'>安装新模块</span>
  <button debug='false' type='button' id='debugmode' class='pn pnc'>
    <strong>调试模式</strong>
  </button>
  <br/>
  <textarea style="display:none;font-family:'Fira Code','Courier New',monospace;background-color:#fbf2db;width:90%;height:150px;overflow:auto;word-break:break-all;resize:vertical;" placeholder='BASE64 编码，URL 或 JavaScript 代码……' id='install_base64'></textarea>
  <br/>
  <input style='width:90%;font-family:"Fira Code","Courier New",monospace;' type='text' class='px' id='install_uno' placeholder='使用 GID 安装……'/>
  <br/>
  <br/>
  <button class='pn pnc' type='button' id='install'>
    <strong>安装</strong>
  </button>
  <br/>
  <br/>
  <br/>
  <button class='pn pnc srcc' type='button' id='use_cv'>
    <strong>快速使用 洞穴夜莺 源（CaveNightingale）</strong>
  </button>
  <span class='srcc'>
    洞穴夜莺的软件源中包含许多轻松使用模块，
    <a id='preview_cv' style='color:#df307f'href='https://www.mcbbs.net/home.php?mod=spacecp&bbsmod=repopreview#CaveNightingale%3ACaveNightingale-MCBBS-Modules%3Amanifest%3Amaster' target='_blank'>
      预览该软件源
    </a>
    。
  </span>
  <br/>
  <br/>
  <button class='pn pnc srcc' type='button' id='use_mext'>
    <strong>快速使用 MExt 整合运动 源（MExt-IM）</strong>
  </button>
  <span class='srcc'>
    MExt 整合运动的软件源中包括了许多适合老用户的 MExt 模块，
    <a id='preview_mext' style='color:#df307f' href='https://www.mcbbs.net/home.php?mod=spacecp&bbsmod=repopreview#MCBBS-Loader%3AIntegration-Motion%3Amanifest%3Amain' target='_blank'>
      预览该软件源
    </a>。
  </span>
  <br/>
</span>`;

const HTML_VIEWREPO_BODY =
  `&nbsp;&nbsp;
  <input class="px" id="viewsrc" type="text" style="width: 50%" placeholder="输入新的软件源地址来加载预览"/>
  &nbsp;
  <button type="button" id="loadview" class="pn pnc">
    <strong>加载预览</strong>
  </button>
  <br/>
  <hr/>
  <span style='font-size:1rem'>该软件源中的模块</span>
  <span style='float: right;'>
    <a href='javascript:;' style='color: #524229;' id='select-all-btn'>反选</a>
    <a href='javascript:;' style='color: #524229;' id='apply-changes-btn'>应用</a>
  </span>
  <br/>
  <div style='overflow:auto;'>
    <ul id='all_modules'></ul>
  </div>
  <hr/>`;

const COMMON_CSS = 
`#_popbg {
  user-select: none;
  cursor: default;
  width: 100%;
  height: 50px;
  background-color: #02020275;
  position: fixed;
  bottom: -50px;
  text-align: center;
  color: #ffffff;
}

input.loadertextconf {
  background-color: white;
  float: right;
  width:50%;
}`;
export { IMG_MCBBS, HTML_MANAGER_FOOTER, HTML_VIEWREPO_BODY, COMMON_CSS };