import { type AssetIndex, Layer } from '@domain/models';

const name = 'lyr1';
const maxAssetIndex = 1 as AssetIndex;

// const palette = {
//   name: 'palette',
//   colors: [
//     {
//       colorName: 'red',
//       colorCode: '#FF0000',
//     },
//   ],
// };

it('should fail with not assets', () => {
  const noAssets = 0 as AssetIndex;
  expect(() => new Layer(name, '', noAssets, 0)).toThrow(
    `Layer '${name}' must have at least one asset.`
  );
});

it('should fail with empty color palette', () => {
  const emptyPalette = { name: 'palette', colors: [] };
  expect(
    () => new Layer(name, '', maxAssetIndex, 0, emptyPalette)
  ).toThrow(`The color palette of layer '${name}' must have colors.`);
});
