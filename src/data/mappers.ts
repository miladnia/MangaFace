import type { ManifestDTO } from "./dtos";
import { Command, Layer } from "../domain/models";
import type {
  Color,
  Manifest,
  Navigator,
  NavigatorOption,
  Position,
  Script,
  Task,
} from "../domain/models";

let scriptsMap: Record<string, Script>;
let commandsMap: Record<string, Command>;
let layersMap: Record<string, Layer>;

export const ManifestMapper = {
  dtoToDomainModel: (dto: ManifestDTO): Manifest => {
    scriptsMap = mapScripts(dto);
    layersMap = mapLayers(dto);
    commandsMap = mapCommands(dto);

    return {
      packName: dto.pack_name,
      initializerScript: findScript(dto.initializer_script),
      navigators: mapNavigators(dto),
      commands: commandsMap,
    } as const;
  },
};

function findScript(name: unknown) {
  return findRecord(name, scriptsMap);
}

function findCommand(name: unknown) {
  return findRecord(name, commandsMap);
}

function findLayer(name: unknown) {
  return findRecord(name, layersMap);
}

function findRecord<T>(name: unknown, map: Record<string, T>): T {
  if ("string" !== typeof name) {
    throw new Error(
      `invalid record name '${name}' for a map with keys: ${Object.keys(map)}`
    );
  }

  const record = map[name];

  if (!record) {
    throw new Error(`no record with the name ${name}`);
  }

  return record;
}

function mapNavigators(dto: ManifestDTO): Navigator[] {
  return dto.navigators.map((nav) => ({
    coverUrl: nav.cover_url,
    options: nav.options.map(
      (opt): NavigatorOption => ({
        title: opt.title,
        command: findCommand(opt.command_name),
      })
    ),
  }));
}

function mapScripts(dto: ManifestDTO): Record<string, Script> {
  return dto.scripts.reduce((acc, scr) => {
    acc[scr.name] = {
      name: scr.name,
      description: scr.description,
      tasks: scr.tasks.map(
        (tsk): Task => ({
          commandName: tsk.command_name,
          itemIndex: tsk.item_index,
          color: tsk.color,
        })
      ),
    };
    return acc;
  }, {} as Record<string, Script>);
}

function mapCommands(dto: ManifestDTO): Record<string, Command> {
  return dto.commands.reduce((acc, cmd) => {
    acc[cmd.name] = new Command(
      cmd.name,
      cmd.item_count,
      cmd.item_preview_url,
      cmd.subscribed_layers.map((lyr) => findLayer(lyr)),
      cmd.color_dependency,
      cmd.default_color,
      (cmd.colors ?? []).map(
        (col): Color => ({
          color: col.color,
          previewColorCode: col.preview_color_code,
        })
      )
    );
    return acc;
  }, {} as Record<string, Command>);
}

function mapLayers(dto: ManifestDTO): Record<string, Layer> {
  return dto.layers.reduce((acc, lyr, index) => {
    acc[lyr.name] = new Layer(lyr.name, index, lyr.asset_url, {
      top: lyr.position.top,
      left: lyr.position.left,
    } as Position);
    return acc;
  }, {} as Record<string, Layer>);
}
