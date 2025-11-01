import { DesignerScreenTemplate } from "./DesignerScreenTemplate";
import type { DesignerViewModel } from "./view_models";
import { CommandNavigator, CommandPanel, Renderer } from "./components";
import { Composer } from "@domain/services";

export default class DesignerScreen {
  #tpl: DesignerScreenTemplate;
  #model: DesignerViewModel;

  constructor(viewModel: DesignerViewModel) {
    this.#model = viewModel;
    this.#tpl = new DesignerScreenTemplate();
  }

  async render() {
    const composer = new Composer(this.#model.manifest);
    const renderer = new Renderer(composer);
    renderer.render(this.#tpl.canvasFrame);

    const commandPanel = new CommandPanel(composer, this.#model.manifest);
    commandPanel.onActionTrigger = (action) => composer.applyAction(action);
    commandPanel.render(this.#tpl.assetGridFrame, this.#tpl.colorGridFrame);

    const commandNavigator = new CommandNavigator(this.#model.manifest);
    commandNavigator.onCommandSelect((commandName) => {
      commandPanel.switchToCommand(commandName);
    });
    commandNavigator.render(
      this.#tpl.commandNavigatorContainer,
      this.#tpl.navOptionsContainer
    );

    composer.runScript(this.#model.manifest.initializerScript);

    return this.#tpl.getView();
  }
}
