import type { NavigatorRepository, CommandRepository, LayerRepository, ScriptRepository } from "../domain/repositories.ts";

export default class ViewModel {
    constructor(
        public navigatorRepository: NavigatorRepository,
        public commandRepository: CommandRepository,
        public layerRepository: LayerRepository,
        public scriptRepository: ScriptRepository,
    ) {
    }
}
