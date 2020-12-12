function setProperty(obj, key, val) {
  obj[key] = val;
}

function getProperty(obj, key) {
  return obj[key];
}

function getUnsafeWindow() {
  return unsafeWindow || window;
}

class UnsupportedOperationException extends Error {
  constructor(message){
    super(message);
  }
}

const permissionNodes = new WeakMap();

class PermissionDenied extends Error {
  constructor(message) {
    super(message);
  }
}
// 代表一项权限
class Permission {
  constructor(name) {
    this.name = name;
  }

  toString() {
    return `[MCBBS Loader Permission] "${name}"`;
  }
}
// 代表一项权限检查实体
class Ticket {
  constructor(name) {
    this.name = name;
    permissionNodes.set(this, new Set());
  }

  toString() {
    return `[MCBBS Loader Ticket] "${name}"`;
  }
}
const CONSOLE_TICKET = new Ticket("debug-console");
const MODULE_TICKETS = new Map();
class PermissionManager{
  static grantPermission(ticket, permission) {
    if(permission instanceof Permission && (ticket instanceof Ticket || ticket === null)) {
      permissionNodes.get(ticket).add(permission);
    } else {
      throw new UnsupportedOperationException("Cannot grant such things");
    }
  }

  static takePermission(ticket, permission) {
    if(permission instanceof Permission && (ticket instanceof Ticket || ticket === null)) {
      permissionNodes.get(ticket).delete(permission);
    } else {
      throw new UnsupportedOperationException("Cannot take such things");
    }
  }

  static hasPermission(ticket, permission) {
    if(ticket === CONSOLE_TICKET){
      return true;
    }else if(permission instanceof Permission && (ticket instanceof Ticket || ticket === null)) {
      return permissionNodes.get(ticket).has(permission);
    } else {
      throw new UnsupportedOperationException("Cannot check such things");
    }
  }

  static assertPermission(ticket, permission) {
    if(!PermissionManager.hasPermission(ticket, permission)) {
      throw new PermissionDenied();
    }
  }
  // 返回一个代表用户控制台的Ticket
  static consoleTicket() {
    let exp = new PermissionDenied();
    let stacktrace = exp.stack.split("\n");
    let pattern = /debugger eval code:[0-9]+/;
    if(stacktrace.length > 2 && (pattern.test(stacktrace[2]) || pattern.test(stacktrace[3]))) {
      return CONSOLE_TICKET;
    } else {
      throw exp;
    }
  }
  // 返回一个代表模块的Ticket
  static moduleTicket(id) {
    let rval = MODULE_TICKETS.get(id);
    if(!rval) {
      MODULE_TICKETS.set(id, rval = new Ticket(`ticket-for-module-${id}`));
    }
    return rval;
  }
}

export {
  setProperty,
  getProperty,
  getUnsafeWindow,
  UnsupportedOperationException,
  Ticket,
  Permission,
  PermissionDenied,
  PermissionManager
};
