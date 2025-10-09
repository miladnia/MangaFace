import {
  Command,
  Layer,
  type AssetIndex,
  type ColorName,
} from "@domain/models";

const name = "cmd1";
const maxAssetIndex = 1 as AssetIndex;
const palette1 = {
  name: "palette",
  colors: [
    {
      colorName: "red" as ColorName,
      colorCode: "#FF0000",
    },
  ],
};
const palette2 = {
  name: "palette",
  colors: [
    {
      colorName: "red" as ColorName,
      colorCode: "#FF0000",
    },
  ],
};

it("should fail when there is no layers", () => {
  expect(() => new Command(name, "/", [])).toThrow(
    `Command '${name}' must have at least one subscribed layer.`
  );
});

it("should fail when layers do not share same color palette", () => {
  const layers = [
    new Layer("layer1", "", maxAssetIndex, 0, palette1),
    new Layer("layer2", "", maxAssetIndex, 0, palette2),
  ];
  expect(() => new Command(name, "/", layers)).toThrow(
    `Command '${name}' must have layers that share the same color palette.`
  );
});

it("should have valid colors when there are some layers with no color palette", () => {
  const layers = [
    new Layer("layer1", "", maxAssetIndex, 0),
    new Layer("layer2", "", maxAssetIndex, 0, palette1),
    new Layer("layer3", "", maxAssetIndex, 0),
    new Layer("layer4", "", maxAssetIndex, 0, palette1),
  ];
  expect(new Command(name, "/", layers).colors).toBe(palette1.colors);
});

it("should fail if layers do not have same amount of assets", () => {
  const layers = [
    new Layer("layer1", "", 1 as AssetIndex, 0, palette1),
    new Layer("layer2", "", 2 as AssetIndex, 0, palette1),
    new Layer("layer3", "", 3 as AssetIndex, 0, palette1),
  ];
  expect(() => new Command(name, "/", layers)).toThrow(
    `Command '${name}' must have layers with the same amount of assets.`
  );
});
