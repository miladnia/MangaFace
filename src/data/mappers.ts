import type { ManifestDTO } from './dtos';
import { Command, Layer } from '../domain/models';
import type {
  Action,
  Color,
  ColorPalette,
  Manifest,
  Navigator,
  NavigatorOption,
  Position,
  Script,
} from '../domain/models';

const modelsCache = {} as Record<string, unknown>;

export const ManifestMapper = {
  dtoToDomainModel: (dto: ManifestDTO): Manifest => {
    return {
      packName: dto.pack_name,
      initializerScript: mapScript(dto, dto.initializer_script),
      navigators: mapAllNavigators(dto),
      commands: mapAllCommands(dto),
    } as const;
  },
};

function mapAllNavigators(dto: ManifestDTO): Navigator[] {
  return dto.navigators.map((nav) => ({
    coverUrl: nav.cover_url,
    options: nav.options.map(
      (opt): NavigatorOption => ({
        title: opt.title,
        command: mapCommand(dto, opt.command_name),
      })
    ),
  }));
}

function mapAllCommands(dto: ManifestDTO): Record<string, Command> {
  const commands = {} as Record<string, Command>;
  for (const name in dto.commands) {
    commands[name] = mapCommand(dto, name);
  }
  return commands;
}

function mapScript(manifestDTO: ManifestDTO, name: string): Script {
  return mapDtoToDomain(name, manifestDTO.scripts, (dto) => ({
    name: name,
    description: dto.description,
    actions: dto.actions.map(
      (act): Action => ({
        commandName: act.command_name,
        assetIndex: act.asset_index,
        colorName: act.color_name,
      })
    ),
  }));
}

function mapCommand(manifestDTO: ManifestDTO, name: string): Command {
  return mapDtoToDomain(
    name,
    manifestDTO.commands,
    (dto) =>
      new Command(
        name,
        dto.preview_url,
        dto.subscribed_layers.map((lyr) => mapLayer(manifestDTO, lyr))
      )
  );
}

function mapLayer(manifestDTO: ManifestDTO, name: string, colorSource?: Layer): Layer {
  return mapDtoToDomain(name, manifestDTO.layers, (dto) => {
    const priority = manifestDTO.layers_priority.indexOf(name);
    const position: Position = {
      top: dto.position.top,
      left: dto.position.left,
    };
    const colorPalette = dto.color_palette_name
      ? mapColorPalette(manifestDTO, dto.color_palette_name)
      : undefined;

    if (!colorSource) {
      colorSource = dto.color_source
        ? mapLayer(manifestDTO, dto.color_source)
        : undefined;
    }

    const newLayer = new Layer(
      name,
      priority,
      position,
      dto.max_asset_index,
      dto.asset_url,
      colorPalette,
      colorSource
    );

    if (!colorSource) {
      // Handle who referenced this layer as color source
      newLayer.referencedBy = Object.entries(manifestDTO.layers)
        .filter(([lyrName, lyr]) => lyrName !== name && lyr.color_source === name)
        .map(([lyrName]) => mapLayer(manifestDTO, lyrName, newLayer));
    }

    return newLayer;
  });
}

function mapColorPalette(manifestDTO: ManifestDTO, name: string): ColorPalette {
  return mapDtoToDomain(name, manifestDTO.color_palettes, (dto) => ({
    name: name,
    colors: (dto.colors ?? []).map(
      (col): Color => ({
        colorName: col.color_name,
        colorCode: col.color_code,
      })
    ),
  }));
}

function mapDtoToDomain<DTO, Domain>(
  name: string,
  dtoRecord: Record<string, DTO>,
  mapper: (dto: DTO) => Domain
): Domain {
  if (!dtoRecord[name]) {
    throw new Error(`The name '${name}' not found in manifest`);
  }
  modelsCache[name] ??= mapper(dtoRecord[name]);
  return modelsCache[name] as Domain;
}
