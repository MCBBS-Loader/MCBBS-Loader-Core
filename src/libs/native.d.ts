declare function setProperty(obj: any, key: string, val: any): void;
declare function getProperty(obj: any, key: string): any;
declare function getUnsafeWindow(): any;
declare class UnsupportedOperationException extends Error {
};
declare class PermissionDenied extends Error {
};
declare class Permission {
	static forName(name: string);
}
declare class Ticket {
}
declare class PermissionManager {
	static grantPermission(ticket: Ticket | null, permission: Permission): undefined;
	static takePermission(ticket: Ticket | null, permission: Permission): undefined;
	static hasPermission(ticket: Ticket | null, permission: Permission): boolean;
	static assertPermission(ticket: Ticket | null, permission: Permission): undefined;
	static consoleTicket(): Ticket;
	static moduleTicket(id: string): Ticket;
}
export { setProperty, getProperty, getUnsafeWindow, UnsupportedOperationException, Permission, Ticket, PermissionDenied, PermissionManager };
