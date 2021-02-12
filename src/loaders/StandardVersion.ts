import { ISerializable } from "./ISerializable";

class StandardVersion implements ISerializable {
  private major: number = 1;
  private minor: number = 0;
  private patch: number = 0;

  constructor(major: number, minor: number, patch: number) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  fromString(string: string): void {
    let vText = string.split(".");
    this.major = parseInt(vText[0]) || 1;
    this.minor = parseInt(vText[1]) || 0;
    this.patch = parseInt(vText[2]) || 0;
  }

  static fromString(string: string): StandardVersion {
    let stv = new StandardVersion(1, 0, 0);
    stv.fromString(string);
    return stv;
  }

  static createEmpty(): StandardVersion {
    return new StandardVersion(1, 0, 0);
  }

  toString(): string {
    return (
      this.major.toString() + this.minor.toString() + this.patch.toString()
    );
  }
}

export { StandardVersion };
