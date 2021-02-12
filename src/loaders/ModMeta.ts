import { ISerializable } from "./ISerializable";
import { StandardVersion } from "./StandardVersion";

class ModMeta implements ISerializable, IUnique, INameable {
  modId: string = "";
  author: string = "";
  name: string = "";
  provider: string = "";
  repo: string = "";
  description: string = "";
  version: StandardVersion = StandardVersion.createEmpty();

  fromString(string: string): void {
    try {
      let obj: any = JSON.parse(string);
      this.modId = String(obj["modId"] || obj["id"] || "").toString();
      this.author = String(obj["author"] || "").toString();
      this.version = StandardVersion.fromString(
        String(obj["version"] || "").toString()
      );
      this.description = String(obj["description"] || "").toString();
      this.provider = String(obj["provider"] || "").toString();
      this.repo = String(obj["repository"] || obj["repo"] || "").toString();
      this.name = String(obj["name"] || "").toString();
    } catch {}
  }

  getAuthor(): string {
    return this.author;
  }

  getBaseId(): string {
    return this.modId;
  }

  getDescription(): string {
    return this.description;
  }

  getName(): string {
    return this.name;
  }

  getUniqueId(): string {
    return (
      this.provider +
      ":" +
      this.repo +
      ":" +
      this.modId +
      ":" +
      this.version.toString()
    );
  }
}

export { ModMeta };
