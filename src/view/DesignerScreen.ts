import { DesignerScreenTemplate } from './DesignerScreenTemplate';
import type { DesignerViewModel } from './view_models';
import { CommandNavigator, CommandPanel, Renderer } from './components';
import { Composer } from '@domain/services';

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
    await renderer.render(this.#tpl.previewFrame);

    const commandPanel = new CommandPanel(composer, this.#model.manifest);
    commandPanel.onNewAction((action) => {
      composer.applyAction(action);
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

    composer.runScript(this.#model.manifest.initializerScript);

    return this.#tpl.getView();
  }
}
