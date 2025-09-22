export type ManifestDTO = {
  pack_name: string;
  initializer_script: string;
  navigators: Array<{
    cover_url: string;
    options: Array<{
      title: string;
      command_name: string;
    }>;
  }>;
  scripts: Array<{
    name: string;
    description: string;
    tasks: Array<{
      command_name: string;
      item_index: number;
      color: string;
    }>;
  }>;
  commands: Array<{
    name: string;
    item_count: number;
    item_preview_url: string;
    subscribed_layers: string[];
    color_dependency: string;
    default_color: string;
    colors: Array<{
      color: string;
      preview_color_code: string;
    }>;
  }>;
  layers: Array<{
    name: string;
    priority: number;
    asset_url: string;
    position: {
      top: number;
      left: number;
    };
  }>;
};
