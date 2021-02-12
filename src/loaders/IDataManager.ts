import { ISerializable } from "./ISerializable";

interface IDataManager {
  malloc(): string;

  free(id: string): void;

  commit(id: string, object: ISerializable): void;

  checkout(id: string): string;
}

export { IDataManager };
