import type { ManifestDTO, RuleDTO } from './dtos';
import { Command, Layer, type RuleOperator } from '../domain/models';
import {
  Rule,
  type Action,
  type Color,
  type ColorPalette,
  type Manifest,
  type Navigator,
  type NavigatorOption,
  type Position,
  type Script,
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

function mapScript(manifestDTO: ManifestDTO, scriptName: string): Script {
  return mapDtoToDomain(scriptName, manifestDTO.scripts, (dto) => ({
    name: scriptName,
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

function mapCommand(manifestDTO: ManifestDTO, commandName: string): Command {
  return mapDtoToDomain(
    commandName,
    manifestDTO.commands,
    (dto) =>
      new Command(
        commandName,
        dto.preview_url,
        dto.subscribed_layers.map((lyr) => mapLayer(manifestDTO, lyr)),
        (dto.rules ?? []).map(mapRule),
      )
  );
}

function mapLayer(manifestDTO: ManifestDTO, layerName: string, colorSource?: Layer): Layer {
  return mapDtoToDomain(layerName, manifestDTO.layers, (dto) => {
    const priority = manifestDTO.layers_priority.indexOf(layerName);
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
      layerName,
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
        .filter(([lyrName, lyr]) => lyrName !== layerName && lyr.color_source === layerName)
        .map(([lyrName]) => mapLayer(manifestDTO, lyrName, newLayer));
    }

    return newLayer;
  });
}

function mapColorPalette(manifestDTO: ManifestDTO, colorPaletteName: string): ColorPalette {
  return mapDtoToDomain(colorPaletteName, manifestDTO.color_palettes, (dto) => ({
    name: colorPaletteName,
    colors: (dto.colors ?? []).map(
      (col): Color => ({
        colorName: col.color_name,
        colorCode: col.color_code,
      })
    ),
  }));
}

function mapRule(ruleDTO: RuleDTO): Rule {
  let indexesToMatch = [];
  let operator: RuleOperator = 'in';
  if (Array.isArray(ruleDTO.on_asset_index.in)) {
    indexesToMatch = ruleDTO.on_asset_index.in;
    operator = 'in';
  } else if (Array.isArray(ruleDTO.on_asset_index.not_in)) {
    indexesToMatch = ruleDTO.on_asset_index.not_in;
    operator = 'not_in';
  } else {
    throw new Error('Rule must have either "in" or "not_in".');
  }
  return new Rule(
    indexesToMatch,
    operator,
    ruleDTO.transform.map((transformerDTO) => ({
      layerName: transformerDTO.layer_name,
      assetIndex: transformerDTO.asset_index,
    })),
  );
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
