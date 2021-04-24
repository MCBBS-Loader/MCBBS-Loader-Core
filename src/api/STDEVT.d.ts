declare class LoaderEvent {
	static emit(name: string, detail: object = {}): void;
	static emitCancelable(name: string, detail: object = {}): boolean;
};
declare function loadEvents(): void;

export { loadEvents, LoaderEvent };