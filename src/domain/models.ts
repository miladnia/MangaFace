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
  name: string;
  itemCount: number;
  itemPreviewUrl: string;
  subscribedLayers: Layer[];
  colorDependency: string;
  defaultColor: string;
  colors: Color[];

  constructor(
    name: string,
    itemCount: number,
    itemPreviewUrl: string,
    subscribedLayers: Layer[],
    colorDependency: string,
    defaultColor: string,
    colors: Color[]
  ) {
    this.name = name;
    this.itemCount = itemCount;
    this.itemPreviewUrl = itemPreviewUrl;
    this.subscribedLayers = subscribedLayers;
    this.colorDependency = colorDependency;
    this.defaultColor = defaultColor;
    this.colors = colors;
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
  name: string;
  priority: number;
  assetUrl: string;
  position: Position;

  constructor(
    name: string,
    priority: number,
    assetUrl: string,
    position: Position
  ) {
    this.name = name;
    this.priority = priority;
    this.assetUrl = assetUrl;
    this.position = position;
  }

  getAssetUrl(itemIndex: number, color: string) {
    return this.assetUrl
      .replace("<ITEM>", itemIndex.toString())
      .replace("<COLOR>", color);
  }
}

export class LayerAsset {
  layer: Layer;
  itemIndex: number;
  color: string;
  position: Position;

  constructor(
    layer: Layer,
    itemIndex: number,
    color: string,
    position: Position
  ) {
    this.layer = layer;
    this.itemIndex = itemIndex;
    this.color = color;
    this.position = position;
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
