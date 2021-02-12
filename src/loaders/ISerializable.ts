interface ISerializable {
  toString(): string;

  fromString(string: string): void;
}

export { ISerializable };
