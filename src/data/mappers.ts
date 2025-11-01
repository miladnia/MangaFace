import type { ManifestDTO, RuleDTO, TransformDTO } from "./dtos";
import {
  Command,
  Layer,
  Rule,
  AssetTransformer,
  type Action,
  type Color,
  type ColorPalette,
  type Manifest,
  type Navigator,
  type NavigatorOption,
  type Position,
  type Script,
  type AssetIndex,
  type ColorName,
  type RuleOperator,
} from "@domain/models";

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
        assetIndex: act.asset_index as AssetIndex,
        colorName: act.color_name as ColorName,
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
        dto.subscribed_layers.map((lyr) => mapLayer(manifestDTO, lyr)),
        dto.preview_url,
        dto.permanent ?? false,
        (dto.rules ?? []).map((ruleDTO) => mapRule(manifestDTO, ruleDTO))
      )
  );
}

function mapLayer(manifestDTO: ManifestDTO, layerName: string): Layer {
  return mapDtoToDomain(layerName, manifestDTO.layers, (dto) => {
    const priority = 1 + manifestDTO.layers_priority.indexOf(layerName);

    const position = dto.position
      ? ({
          top: dto.position.top,
          left: dto.position.left,
        } satisfies Position)
      : undefined;

    const colorPalette = dto.color_palette_name
      ? mapColorPalette(manifestDTO, dto.color_palette_name)
      : undefined;

    const colorSource = dto.color_source
      ? mapLayer(manifestDTO, dto.color_source)
      : undefined;
    
    const variantSource = dto.variant_source
      ? mapLayer(manifestDTO, dto.variant_source)
      : undefined;

    return new Layer(
      layerName,
      dto.asset_url,
      dto.max_asset_index as AssetIndex,
      priority,
      colorPalette,
      colorSource,
      variantSource,
      position
    );
  });
}

function mapColorPalette(
  manifestDTO: ManifestDTO,
  colorPaletteName: string
): ColorPalette {
  return mapDtoToDomain(
    colorPaletteName,
    manifestDTO.color_palettes,
    (dto) => ({
      name: colorPaletteName,
      colors: (dto.colors ?? []).map(
        (col): Color => ({
          colorName: col.color_name as ColorName,
          colorCode: col.color_code,
        })
      ),
    })
  );
}

function mapRule(manifestDTO: ManifestDTO, dto: RuleDTO): Rule {
  let indexesToMatch = [];
  let operator: RuleOperator = "in";

  if (Array.isArray(dto.on_asset_index.in)) {
    indexesToMatch = dto.on_asset_index.in;
    operator = "in";
  } else if (Array.isArray(dto.on_asset_index.not_in)) {
    indexesToMatch = dto.on_asset_index.not_in;
    operator = "not_in";
  } else {
    throw new Error('\'on_asset_index\' must have either "in" or "not_in".');
  }

  return new Rule(
    indexesToMatch as AssetIndex[],
    operator,
    dto.transform.map((transformerDTO) =>
      mapTransformer(manifestDTO, transformerDTO)
    ),
    dto.description
  );
}

function mapTransformer(
  manifestDTO: ManifestDTO,
  dto: TransformDTO
): AssetTransformer {
  let eligibleSourceIndexes: AssetIndex[] | undefined = undefined;
  let operator: RuleOperator | undefined = undefined;

  if (dto.if_asset_index) {
    if (Array.isArray(dto.if_asset_index.in)) {
      eligibleSourceIndexes = dto.if_asset_index.in as AssetIndex[];
      operator = "in";
    } else if (Array.isArray(dto.if_asset_index.not_in)) {
      eligibleSourceIndexes = dto.if_asset_index.not_in as AssetIndex[];
      operator = "not_in";
    } else {
      throw new Error("'if_asset_index' must have either 'in' or 'not_in'.");
    }
  }

  return new AssetTransformer(
    mapLayer(manifestDTO, dto.layer_name),
    dto.to_asset_index as AssetIndex,
    eligibleSourceIndexes,
    operator
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
