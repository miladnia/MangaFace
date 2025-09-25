import { Layer, Position } from '../src/domain/models';

const name = 'lyr1';
const posZero: Position = {left: 0, top: 0};
const defPalette = {name: 'palette', colors: []};

it('should fail with not assets', () => {
  const noAssets = 0;
  expect(
    () => new Layer(name, 0, posZero, noAssets, '/', defPalette)
  ).toThrow(`Layer '${name}' must have at least one asset.`);
});
