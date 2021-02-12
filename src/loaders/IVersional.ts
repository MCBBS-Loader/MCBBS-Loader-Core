import { StandardVersion } from "./StandardVersion";

interface IVersional {
  getStandardVersion(): StandardVersion;

  getDevName(): string;

  isLaterThan(obj: IVersional): string;
}

export { IVersional };
