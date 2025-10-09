export type AssetIndex = number & { readonly __brand: unique symbol };

export type ColorName = string & { readonly __brand: unique symbol };

export type ColorPalette = {
  readonly name: string;
  readonly colors: Color[];
};

export type Color = {
  readonly colorName: ColorName;
  readonly colorCode: string;
};

export type Position = {
  readonly top: number;
  readonly left: number;
};
