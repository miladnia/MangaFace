import { DesignerScreenTemplate } from "./DesignerScreenTemplate";
import CommandNavigator from "./components/CommandNavigator";
import CommandPanel from "./components/CommandPanel";
import CanvasPreview from "./components/CanvasPreview";
import Canvas from "../domain/Canvas";
import type { DesignerViewModel } from "./view_models";

export default class DesignerScreen {
  #tpl: DesignerScreenTemplate;

  constructor(private viewModel: DesignerViewModel) {
    this.#tpl = new DesignerScreenTemplate();
  }

  async render() {
    const canvas = new Canvas(this.viewModel.manifest);

    const canvasPreview = new CanvasPreview(canvas);
    await canvasPreview.render(this.#tpl.previewFrame);

    const commandPanel = new CommandPanel(canvas, this.viewModel.manifest);
    commandPanel.onNewTask((task) => {
      canvas.runTask(task);
    });
    await commandPanel.render(this.#tpl.shapesFrame, this.#tpl.colorsFrame);

    const commandNavigator = new CommandNavigator(this.viewModel.manifest);
    commandNavigator.onCommandSelect((commandName) => {
      commandPanel.showCommandControllers(commandName);
    });
    await commandNavigator.render(
      this.#tpl.sectionsFrame,
      this.#tpl.designersFrame
    );

    canvas.runScript(this.viewModel.manifest.initializerScript);

    return this.#tpl.getView();
  }
}
