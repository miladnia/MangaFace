import { DesignerScreenTemplate } from './DesignerScreenTemplate.js';
import CommandNavigator from './components/CommandNavigator.js';
import CommandPanel from './components/CommandPanel.js';
import CanvasPreview from './components/CanvasPreview.js';
import Canvas from '../domain/Canvas.js';


export default class DesignerScreen {
    _tpl = new DesignerScreenTemplate();
    _model = null;

    constructor(viewModel) {
        this._model = viewModel;
    }

    async render() {
        const canvas = new Canvas(
            this._model.commandRepository,
            this._model.layerRepository);

        const canvasPreview = new CanvasPreview(canvas);
        await canvasPreview.render(this._tpl.previewFrame);

        const commandPanel = new CommandPanel(
            canvas,
            this._model.navigatorRepository,
            this._model.commandRepository);
        commandPanel.onNewTask((task) => {
            canvas.runTask(task);
        });
        await commandPanel.render(
            this._tpl.shapesFrame,
            this._tpl.colorsFrame);

        const commandNavigator = new CommandNavigator(
            this._model.navigatorRepository);
        commandNavigator.onCommandSelect(commandName => {
            commandPanel.showCommandControllers(commandName);
        });
        await commandNavigator.render(
            this._tpl.sectionsFrame,
            this._tpl.designersFrame);

        // TODO get the name of the initializer script as a metadata
        const script = await this._model.scriptRepository.findByName('initializer_script');
        if (!script) {
            throw new Error('No initializer script found!');
        }
        canvas.runScript(script);

        return this._tpl.getView();
    }
}
