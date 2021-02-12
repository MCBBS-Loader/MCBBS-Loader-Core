interface IUpdatable {
  getUpdateURL(): URL;

  isUpToDate(): boolean;

  update(): void;
}

export { IUpdatable };
