import { NavigatorDao, CommandDao, LayerDao, ScriptDao } from "./dao.js";
import { NavigatorRepository, CommandRepository, LayerRepository, ScriptRepository } from "../domain/repositories.js";

export default class AppContainer {
    navigatorRepository: NavigatorRepository;
    commandRepository: CommandRepository;
    layerRepository: LayerRepository;
    scriptRepository: ScriptRepository;

    constructor(packName: string) {
        this.navigatorRepository = new NavigatorRepository(new NavigatorDao(packName));
        this.commandRepository = new CommandRepository(new CommandDao(packName));
        this.layerRepository = new LayerRepository(new LayerDao(packName));
        this.scriptRepository = new ScriptRepository(new ScriptDao(packName));
    }
}
