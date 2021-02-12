import { IDataManager } from "./IDataManager";
import { ISerializable } from "./ISerializable";

class LocalStorageManager implements IDataManager {
  pointerIndex: number =
    parseInt(localStorage.getItem("ls-mgr.pointer") || "1") || 1;

  checkout(id: string): string {
    return localStorage.getItem("LS-BP-" + id) || "";
  }

  commit(id: string, object: ISerializable): void {
    localStorage.setItem("LS-BP-" + id, object.toString());
  }

  free(id: string): void {
    localStorage.removeItem("LS-BP-" + id);
  }

  malloc(): string {
    this.pointerIndex += 1;
    localStorage.setItem("ls-mgr.pointer", this.pointerIndex.toString());
    return this.pointerIndex.toString();
  }
}
