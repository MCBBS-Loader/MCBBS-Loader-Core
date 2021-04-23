import { getUnsafeWindow } from "../libs/native";

function showSuccess(msg, title, callback) {
  getUnsafeWindow().showDialog(msg, "right", title, callback);
}

function showAlert(msg, title, callback) {
  getUnsafeWindow().showDialog(msg, "alert", title, callback);
}

function showDialogFull(config) {
  showDialog(
    config.msg,
    config.mode,
    config.title,
    config.onClick,
    config.cover,
    config.onCancel,
    config.confirmText,
    config.cancelText,
    config.closeTime,
    config.locationTime
  );
}

function showPopper(msg) {
  getUnsafeWindow().showError(msg);
}

function showOfflineWindow(k, element, menuv) {
  let menuid = 'fwin_' + k;
  let menuObj = $(menuid);
  let hidedom = '';
  let show = function () {
    hideMenu('fwin_dialog', 'dialog');
    let v = {
      mtype: 'win',
      menuid: menuid,
      duration: 3,
      pos: '00',
      zindex: JSMENU['zIndex']['win'],
      drag: '',
      cache: -1
    };
    for (k in menuv)
      v[k] = menuv[k];
    showMenu(v);
  };
  if (!menuObj) {
    menuObj = document.createElement('div');
    menuObj.id = menuid;
    menuObj.className = 'fwinmask';
    menuObj.style.opacity = 0;
    menuObj.style.pointerEvents = 'none';
    document.getElementById('append_parent').appendChild(menuObj);
    evt = ' style="cursor:move" onmousedown="dragMenu($(\'' + menuid + '\'), event, 1)" ondblclick="hideWindow(\'' + k + '\')"';
    hidedom = '<style type="text/css">object{visibility:hidden;}</style>';
    menuObj.innerHTML = hidedom + '<table cellpadding="0" cellspacing="0" class="fwin"><tr><td class="t_l"></td><td class="t_c"' + evt + '></td><td class="t_r"></td></tr><tr><td class="m_l"' + evt + ')">&nbsp;&nbsp;</td><td class="m_c" id="fwin_content_' + k + '">' + '</td><td class="m_r"' + evt + '"></td></tr><tr><td class="b_l"></td><td class="b_c"' + evt + '></td><td class="b_r"></td></tr></table>';
    if(element instanceof Text || element instanceof HTMLElement)
      document.getElementById('fwin_content_' + k).appendChild(element);
    else
      document.getElementById('fwin_content_' + k).innerHTML = element;
  }
  show();
  doane();
}

export { showAlert, showPopper, showSuccess, showDialogFull, showOfflineWindow };
