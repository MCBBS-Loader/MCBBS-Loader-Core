declare function showSuccess(msg: string, title?: string, callback?: () => void): void;

declare function showAlert(msg: string, title?: string, callback?: () => void): void;

declare function showPopper(msg: string): void;

declare function showDialogFull(config: any): void;

declare function showOfflineWindow(k: string, element: HTMLElement | Text | string, menuv?: object);

export { showPopper, showAlert, showSuccess, showDialogFull, showOfflineWindow };
