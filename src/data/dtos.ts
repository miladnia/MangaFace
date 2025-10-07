export type ManifestDTO = {
  pack_name: string;
  initializer_script: string;
  color_palettes: Record<string, {
    name: string;
    colors: Array<{
      color_name: string;
      color_code: string;
    }>;
  }>;
  navigators: Array<{
    cover_url: string;
    options: Array<{
      title: string;
      command_name: string;
    }>;
  }>;
  scripts: Record<string, ScriptDTO>;
  commands: Record<string, CommandDTO>;
  layers: Record<string, LayerDTO>;
  layers_priority: string[];
};

export type ScriptDTO = {
  description: string;
  actions: Array<{
    command_name: string;
    asset_index: number;
    color_name: string;
  }>;
};

export type CommandDTO = {
  preview_url: string;
  subscribed_layers: string[];
  rules?: RuleDTO[];
};

export type LayerDTO = {
  max_asset_index: number;
  color_palette_name?: string;
  color_source?: string;
  asset_url: string;
  position?: {
    top: number;
    left: number;
  };
};

export type RuleDTO = {
  description?: string;
  on_asset_index: {
    in?: number[];
    not_in?: number[];
  };
  transform: TransformDTO[];
};

export type TransformDTO = {
  layer_name: string;
  to_asset_index: number;
  if_asset_index?: {
    in?: number[];
    not_in?: number[];
  };
};
