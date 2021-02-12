declare function showSuccess(
  msg: string,
  title?: string,
  callback?: () => void
): void;

declare function showAlert(
  msg: string,
  title?: string,
  callback?: () => void
): void;

declare function showPopper(msg: string): void;

declare function showDialogFull(config: any): void;

export { showPopper, showAlert, showSuccess, showDialogFull };
