export default class ViewModel {
    constructor(
        layout,
        navigatorRepository,
        commandRepository,
        layerRepository,
        scriptRepository,
    ) {
        this._layout = layout;
        this.navigatorRepository = navigatorRepository;
        this.commandRepository = commandRepository;
        this.layerRepository = layerRepository;
        this.scriptRepository = scriptRepository;
    }
}
