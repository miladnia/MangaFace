import { DesignerScreenTemplate } from './DesignerScreenTemplate.ts';
import CommandNavigator from './components/CommandNavigator.ts';
import CommandPanel from './components/CommandPanel.ts';
import CanvasPreview from './components/CanvasPreview.ts';
import Canvas from '../domain/Canvas.ts';
import type ViewModel from '../view/ViewModel.ts'

export default class DesignerScreen {
    #tpl: DesignerScreenTemplate;
    #model: ViewModel;

    constructor(viewModel: ViewModel) {
        this.#model = viewModel;
        this.#tpl = new DesignerScreenTemplate();
    }

    async render() {
        const canvas = new Canvas(
            this.#model.commandRepository,
            this.#model.layerRepository);

        const canvasPreview = new CanvasPreview(canvas);
        await canvasPreview.render(this.#tpl.previewFrame);

        const commandPanel = new CommandPanel(
            canvas,
            this.#model.navigatorRepository,
            this.#model.commandRepository);
        commandPanel.onNewTask(task => {
            canvas.runTask(task);
        });
        await commandPanel.render(
            this.#tpl.shapesFrame,
            this.#tpl.colorsFrame);

        const commandNavigator = new CommandNavigator(
            this.#model.navigatorRepository);
        commandNavigator.onCommandSelect(commandName => {
            commandPanel.showCommandControllers(commandName);
        });
        await commandNavigator.render(
            this.#tpl.sectionsFrame,
            this.#tpl.designersFrame);

        // TODO get the name of the initializer script as a metadata
        const script = await this.#model.scriptRepository.findByName('initializer_script');
        if (!script) {
            throw new Error('No initializer script found!');
        }
        canvas.runScript(script);

        return this.#tpl.getView();
    }
}
