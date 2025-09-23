import { DesignerScreenTemplate } from "./DesignerScreenTemplate";
import CommandNavigator from "./components/CommandNavigator";
import CommandPanel from "./components/CommandPanel";
import CanvasPreview from "./components/CanvasPreview";
import Canvas from "../domain/Canvas";
import type { DesignerViewModel } from "./view_models";

export default class DesignerScreen {
  #tpl: DesignerScreenTemplate;
  #model: DesignerViewModel;

  constructor(viewModel: DesignerViewModel) {
    this.#model = viewModel;
    this.#tpl = new DesignerScreenTemplate();
  }

  async render() {
    const canvas = new Canvas(this.#model.manifest);

    const canvasPreview = new CanvasPreview(canvas);
    await canvasPreview.render(this.#tpl.previewFrame);

    const commandPanel = new CommandPanel(canvas, this.#model.manifest);
    commandPanel.onNewTask((task) => {
      canvas.runTask(task);
    });
    await commandPanel.render(this.#tpl.shapesFrame, this.#tpl.colorsFrame);

    const commandNavigator = new CommandNavigator(this.#model.manifest);
    commandNavigator.onCommandSelect((commandName) => {
      commandPanel.showCommandControllers(commandName);
    });
    await commandNavigator.render(
      this.#tpl.sectionsFrame,
      this.#tpl.designersFrame
    );

    canvas.runScript(this.#model.manifest.initializerScript);

    return this.#tpl.getView();
  }
}
