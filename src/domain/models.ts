export type Manifest = {
  packName: string;
  initializerScript: Script;
  navigators: Navigator[];
  commands: Record<string, Command>;
};

export type Navigator = {
  coverUrl: string;
  options: NavigatorOption[];
};

export type NavigatorOption = {
  title: string;
  command: Command;
};

export type Script = {
  name: string;
  description: string;
  tasks: Task[];
};

export type Task = {
  commandName: string;
  itemIndex: number;
  color: string;
};

export type Position = {
  top: number;
  left: number;
};

export type Color = {
  color: string;
  previewColorCode: string;
};

export class Command {
  constructor(
    public name: string,
    public itemCount: number,
    public itemPreviewUrl: string,
    public subscribedLayers: Layer[],
    public colorDependency: string,
    public defaultColor: string,
    public colors: Color[],
  ) {
  }

  getItemPreviewUrl(itemIndex: number) {
    return this.itemPreviewUrl.replace("<ITEM>", itemIndex.toString());
  }

  isColorRequired() {
    return this.colors.length > 0 || this.colorDependency;
  }

  hasColorDependency() {
    return !!this.colorDependency;
  }
}

export class Layer {
  constructor(
    public name: string,
    public priority: number,
    public assetUrl: string,
    public position: Position,
  ) {
  }

  getAssetUrl(itemIndex: number, color: string) {
    return this.assetUrl
      .replace("<ITEM>", itemIndex.toString())
      .replace("<COLOR>", color);
  }
}

export class LayerAsset {
  constructor(
    public layer: Layer,
    public itemIndex: number,
    public color: string,
    public position: Position,
  ) {
  }

  get layerName() {
    return this.layer.name;
  }

  get url() {
    return this.layer.getAssetUrl(this.itemIndex, this.color);
  }

  get priority() {
    return this.layer.priority;
  }
}

// export class Rule {
//   constructor({ itemsToMatch, forcedLayers, conditions }) {
//     this.itemsToMatch = itemsToMatch;
//     this.forcedLayers = forcedLayers;
//     this.conditions = conditions;
//   }

//   matchItem({ item }) {
//     return this.itemsToMatch.includes(item);
//   }
// }
