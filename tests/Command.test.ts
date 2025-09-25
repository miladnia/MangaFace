import { Command, Layer, Position } from '../src/domain/models';

const name = 'cmd1';
const posZero: Position = {left: 0, top: 0};
const defPalette = {name: 'palette', colors: []};

it('should fail when there is no layers', () => {
  expect(
    () => new Command(name, '/', [])
  ).toThrow(`Command '${name}' must have at least one subscribed layer.`);
});

it('should fail when layers do not share same color palette', () => {
  const layers = [
    new Layer('layer1', 0, posZero, 1, '/', {name: 'palette', colors: []}),
    new Layer('layer2', 1, posZero, 1, '/', {name: 'palette', colors: []}),
  ];
  expect(
    () => new Command(name, '/', layers)
  ).toThrow(`Command '${name}' must have layers that share the same color palette.`);
});

it('should have valid colors when there are some layers with no color palette', () => {
  const layers = [
    new Layer('layer1', 0, posZero, 1, '/'),
    new Layer('layer2', 0, posZero, 1, '/', defPalette),
    new Layer('layer3', 0, posZero, 1, '/'),
    new Layer('layer4', 1, posZero, 1, '/', defPalette),
  ];
  expect(
    new Command(name, '/', layers).colors
  ).toBe(defPalette.colors);
});

it('should fail if layers do not have same amount of assets', () => {
  const maxAssetIndex_1 = 10;
  const maxAssetIndex_2 = 10;
  const maxAssetIndex_3 = 15;
  const layers = [
    new Layer('layer1', 0, posZero, maxAssetIndex_1, '/', defPalette),
    new Layer('layer2', 1, posZero, maxAssetIndex_2, '/', defPalette),
    new Layer('layer3', 2, posZero, maxAssetIndex_3, '/', defPalette),
  ];
  expect(
    () => new Command(name, '/', layers)
  ).toThrow(`Command '${name}' must have layers with the same amount of assets.`);
});
